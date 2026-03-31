require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@orbitx.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log('Admin account synchronization complete:', { email: user.email, role: user.role });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
