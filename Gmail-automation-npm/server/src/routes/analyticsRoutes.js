const express = require('express');
const router = express.Router();
const { getStats, getCampaignStats } = require('../controllers/analyticsController');

router.get('/overview', getStats);
router.get('/campaign/:id', getCampaignStats);

module.exports = router;
