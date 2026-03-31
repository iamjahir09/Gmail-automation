const { PrismaClient } = require('@prisma/client');

// Singleton instance to prevent multiple connection pools
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Explicitly handle app termination to close DB pool
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

module.exports = prisma;
