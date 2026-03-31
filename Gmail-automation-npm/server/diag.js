const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  try {
    const users = await prisma.user.count();
    const campaigns = await prisma.campaign.count();
    const contacts = await prisma.contact.count();
    const logs = await prisma.emailLog.count();
    const sentLogs = await prisma.emailLog.count({ where: { status: 'SENT' } });
    const events = await prisma.event.count();
    const runningCampaigns = await prisma.campaign.findMany({ where: { status: 'RUNNING' } });

    console.log('--- DB DIAGNOSTICS ---');
    console.log('Users:', users);
    console.log('Campaigns:', campaigns);
    console.log('Contacts:', contacts);
    console.log('Total Logs:', logs);
    console.log('Sent Logs:', sentLogs);
    console.log('Total Events:', events);
    console.log('Running Campaigns IDs:', runningCampaigns.map(c => c.id));
    console.log('----------------------');
  } catch (err) {
    console.error('DIAGNOSTICS ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
