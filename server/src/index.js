require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma');
const app = express();

app.use(cors());
app.use(express.json());

// Main entry route
app.get('/', (req, res) => {
  res.json({ message: 'Bulk Email SaaS API is running' });
});

// Import Routes
const campaignRoutes = require('./routes/campaignRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { trackOpen } = require('./controllers/trackingController');

app.use('/api/campaigns', campaignRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/accounts', accountRoutes);

// Tracking Endpoint
app.get('/api/track/open/:logId', trackOpen);

// Initialize Background Worker
require('./worker/emailWorker');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export prisma for other modules
module.exports = { app, prisma };
