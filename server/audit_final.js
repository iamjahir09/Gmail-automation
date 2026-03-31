const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function audit() {
  try {
    const campaignsCount = await prisma.campaign.count();
    const logsCount = await prisma.emailLog.count();
    const campaignsWithLogsCount = await prisma.campaign.count({ where: { logs: { some: {} } } });
    const campaigns = await prisma.campaign.findMany({
      include: { _count: { select: { logs: true } } }
    });
    const data = { campaignsCount, logsCount, campaignsWithLogsCount, campaigns };
    fs.writeFileSync('audit_db_final.json', JSON.stringify(data, null, 2));
    console.log('AUDIT FINAL DONE');
  } catch (err) {
    console.error('AUDIT ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
audit();
