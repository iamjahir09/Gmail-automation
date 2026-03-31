require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./src/prisma');
const app = express();

app.use(cors());
app.use(express.json());

// Main entry route
app.get('/', (req, res) => {
  res.json({ message: 'Bulk Email SaaS API is running' });
});

// Import Routes (relative to root)
const campaignRoutes = require('./src/routes/campaignRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const inboxRoutes = require('./src/routes/inboxRoutes');
const { trackOpen } = require('./src/controllers/trackingController');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/inbox', inboxRoutes);

// Tracking Endpoint
app.get('/api/track/open/:logId', trackOpen);

// Initialize Background Worker
require('./src/worker/emailWorker');

const PORT = process.env.PORT || 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setupAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@orbitx.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: adminPassword, role: 'ADMIN' },
        create: { email: adminEmail, password: adminPassword, name: 'System Admin', role: 'ADMIN' },
      });
      console.log(`[Auto-Sync] Admin account ready: ${adminEmail}`);
      return; // success
    } catch (error) {
      if (attempt < 5) {
        console.warn(`[Auto-Sync] DB not ready yet (attempt ${attempt}/5). Retrying in 3s... (Neon waking up)`);
        await sleep(3000);
      } else {
        console.error("[Auto-Sync] Could not reach DB after 5 attempts. Server will still run.");
      }
    }
  }
};

// Global Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('\n[GLOBAL ERROR TRAP] Express caught an unhandled exception:');
  console.error(err.stack || err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, async () => {
  await setupAdmin();
  console.log(`Server running on port ${PORT}`);
  
  // Debug Heartbeat: Logs DB state every 30s to verify worker & stats
  setInterval(async () => {
    try {
      const total = await prisma.emailLog.count();
      const sent = await prisma.emailLog.count({ where: { status: 'SENT' } });
      const running = await prisma.campaign.count({ where: { status: 'RUNNING' } });
      console.log(`[Heartbeat] DB Check -> Total Logs: ${total}, Sent: ${sent}, Active Campaigns: ${running}`);
    } catch (e) {
      console.error('[Heartbeat] DB Error:', e.message);
    }
  }, 30000);
});

module.exports = { app, prisma };
