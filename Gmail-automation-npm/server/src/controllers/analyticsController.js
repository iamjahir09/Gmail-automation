const prisma = require('../prisma');

const getStats = async (req, res) => {
  try {
    console.log('[Analytics] Fetching real-time stats (Optimized)...');
    
    // 1. Fetch campaigns and their log counts together for efficiency
    const allCampaigns = await prisma.campaign.findMany({
       include: { 
         _count: { 
           select: { logs: true }
         }
       }
    });

    // 2. Filter out campaigns with 0 logs (ghost data)
    const activeCampaigns = allCampaigns.filter(c => c._count.logs > 0);
    const campaignCount = activeCampaigns.length;
    const activeCampaignIds = activeCampaigns.map(c => c.id);

    // 3. Core Counts (Bulk query if possible, or keep simple)
    const sentCount = await prisma.emailLog.count({ where: { status: 'SENT', campaignId: { in: activeCampaignIds } } });
    const openCount = await prisma.event.count({ where: { type: 'OPEN', log: { campaignId: { in: activeCampaignIds } } } });
    const clickCount = await prisma.event.count({ where: { type: 'CLICK', log: { campaignId: { in: activeCampaignIds } } } });
    const replyCount = await prisma.event.count({ where: { type: 'REPLY', log: { campaignId: { in: activeCampaignIds } } } });

    // 4. Calculate Rates
    const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;
    const replyRate = sentCount > 0 ? (replyCount / sentCount) * 100 : 0;

    // 5. Robust Trend Data (Last 7 Days) - Optimized: No more bulk findMany
    const trends = [];
    const now = new Date();
    
    // We'll fetch today's hourly stats separately to avoid pulling massive history
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const [sentTrendPromises, openTrendPromises] = [[], []];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const start = new Date(d.setHours(0,0,0,0));
      const end = new Date(d.setHours(23,59,59,999));

      sentTrendPromises.push(prisma.emailLog.count({
        where: { sentAt: { gte: start, lte: end }, status: 'SENT', campaignId: { in: activeCampaignIds } }
      }));
      openTrendPromises.push(prisma.event.count({
        where: { createdAt: { gte: start, lte: end }, type: 'OPEN', log: { campaignId: { in: activeCampaignIds } } }
      }));
    }

    const sentTrendResults = await Promise.all(sentTrendPromises);
    const openTrendResults = await Promise.all(openTrendPromises);

    for (let i = 0; i < 7; i++) {
       const targetDate = new Date();
       targetDate.setDate(now.getDate() - (6 - i));
       trends.push({
         name: targetDate.toLocaleDateString('en-US', { weekday: 'short' }),
         sent: sentTrendResults[i],
         opens: openTrendResults[i]
       });
    }

    // 6. Campaign Distribution
    const campaignDist = [
      { name: 'Running', value: activeCampaigns.filter(c => c.status === 'RUNNING').length },
      { name: 'Paused', value: activeCampaigns.filter(c => c.status === 'PAUSED').length },
      { name: 'Draft', value: activeCampaigns.filter(c => c.status === 'DRAFT').length },
      { name: 'Completed', value: activeCampaigns.filter(c => c.status === 'COMPLETED').length },
    ];

    // 7. [NEW] Top Performing Campaigns (Ranked by Open Rate)
    const campaignStats = activeCampaigns.map(c => {
      const sent = c._count.logs;
      // This is a bit heavy, but since we only have few active campaigns, it's okay.
      // In production, we'd cache these rates.
      return {
        id: c.id,
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        sent: sent,
        openRate: 0 // Placeholder, will calculate below
      };
    });

    const openRatePromises = activeCampaigns.map(c => 
      prisma.event.count({ where: { type: 'OPEN', log: { campaignId: c.id } } })
    );
    const openResults = await Promise.all(openRatePromises);
    
    const topCampaigns = campaignStats.map((stats, i) => ({
      ...stats,
      openRate: stats.sent > 0 ? (openResults[i] / stats.sent) * 100 : 0
    })).sort((a,b) => b.openRate - a.openRate).slice(0, 5);

    // 8. [NEW] Global Delivery Health (Queue Status)
    const [totalPending, totalFailed] = await Promise.all([
      prisma.emailLog.count({ where: { status: 'PENDING' } }),
      prisma.emailLog.count({ where: { status: 'FAILED' } })
    ]);

    const deliveryHealth = [
      { name: 'Sent', value: sentCount, fill: '#3b82f6' },
      { name: 'Pending', value: totalPending, fill: '#94a3b8' },
      { name: 'Failed', value: totalFailed, fill: '#ef4444' }
    ];

    // --- Unified Recent Activity Engine (Logs + Events) ---
    const [latestLogs, latestEvents] = await Promise.all([
      prisma.emailLog.findMany({
        where: { status: 'SENT', campaignId: { in: activeCampaignIds } },
        take: 15,
        orderBy: { sentAt: 'desc' },
        include: { contact: true }
      }),
      prisma.event.findMany({
        where: { log: { campaignId: { in: activeCampaignIds } } },
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { log: { include: { contact: true } } }
      })
    ]);

    const mergedActivity = [
      ...latestLogs.map(l => ({
        id: `l-${l.id}`,
        user: l.contact?.name || l.contact?.email || 'System',
        action: 'was sent your email',
        time: formatRelativeTime(l.sentAt),
        rawTime: new Date(l.sentAt).getTime(),
        type: 'sent'
      })),
      ...latestEvents.map(e => ({
        id: `e-${e.id}`,
        user: e.log?.contact?.name || e.log?.contact?.email || 'Lead',
        action: { 'OPEN': 'opened your email', 'CLICK': 'clicked a link', 'REPLY': 'replied to you' }[e.type] || 'interacted',
        time: formatRelativeTime(e.createdAt),
        rawTime: new Date(e.createdAt).getTime(),
        type: e.type.toLowerCase()
      }))
    ].sort((a,b) => b.rawTime - a.rawTime).slice(0, 10);

    res.json({
      sent: sentCount,
      opens: openCount,
      clicks: clickCount,
      replies: replyCount,
      campaignCount,
      campaignDist,
      topCampaigns,
      deliveryHealth,
      openRate,
      clickRate,
      replyRate,
      trends,
      recentActivity: mergedActivity
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);
    res.status(500).json({ error: error.message });
  }
};


const getCampaignStats = async (req, res) => {
  const { id } = req.params;
  try {
    const sent = await prisma.emailLog.count({ where: { campaignId: id, status: 'SENT' } });
    const opens = await prisma.event.count({ where: { log: { campaignId: id }, type: 'OPEN' } });
    res.json({ sent, opens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function formatRelativeTime(date) {
  const diff = new Date() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(date).toLocaleDateString();
}

module.exports = { getStats, getCampaignStats };
