const prisma = require('../prisma');

const getInboxEmails = async (req, res) => {
  try {
    const logs = await prisma.emailLog.findMany({
      include: {
        contact: true,
        campaign: {
          include: {
            templates: true,
          }
        },
        account: true
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Serialize database models into UI expected parameters
    const emails = logs.map(log => {
      const template = log.campaign.templates[0]; 
      
      // Categorize folders based on status
      let folderMap = 'sent'; // All outbound campaign emails default to Sent
      if (log.status === 'SENT') folderMap = 'sent';
      if (log.status === 'PENDING' || log.status === 'PROCESSING') folderMap = 'sent'; // Queued outbound = sent view
      if (log.status === 'FAILED') folderMap = 'trash';
      if (log.status === 'SCHEDULED') folderMap = 'scheduled';

      return {
        id: log.id,
        folder: folderMap,
        sender: log.contact.name || log.contact.email,
        email: log.contact.email,
        subject: template?.subject || `Campaign: ${log.campaign.name}`,
        preview: template?.body ? (template.body.substring(0, 90) + '...') : 'Message content parsing...',
        body: template?.body || 'Content resolving in OrbitX pipeline...',
        date: new Date(log.sentAt || log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        unread: folderMap === 'sent' ? false : true,
        starred: false
      };
    });

    res.json(emails);
  } catch (error) {
    console.error("Backend Error [getInboxEmails]:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getInboxEmails };
