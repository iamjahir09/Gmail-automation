const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list() {
  const c = await prisma.campaign.findMany({
    select: { id: true, name: true, createdAt: true, status: true }
  });
  console.log(JSON.stringify(c, null, 2));
  await prisma.$disconnect();
}
list();
