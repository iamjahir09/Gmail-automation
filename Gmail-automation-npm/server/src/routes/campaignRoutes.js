const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { 
  createCampaign, 
  getCampaigns, 
  uploadContacts, 
  updateStatus,
  getAllContacts,
  getAllTemplates
} = require('../controllers/campaignController');

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/contacts', getAllContacts);
router.get('/templates', getAllTemplates);
router.patch('/:id/status', updateStatus);
router.post('/:campaignId/contacts', upload.single('csv'), uploadContacts);

module.exports = router;
