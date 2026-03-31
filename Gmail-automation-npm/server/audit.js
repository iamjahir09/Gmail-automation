const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function audit() {
  try {
    const campaigns = await prisma.campaign.findMany({
      select: { id: true, name: true, createdAt: true, status: true, _count: { select: { logs: true } } }
    });
    const sentLogs = await prisma.emailLog.findMany({
      where: { status: 'SENT' },
      select: { id: true, sentAt: true, campaignId: true }
    });
    const data = { campaigns, sentLogs };
    fs.writeFileSync('audit_output.json', JSON.stringify(data, null, 2));
    console.log('AUDIT DONE');
  } catch (err) {
    console.error('AUDIT ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
audit();
