const express = require('express');
const router = express.Router();
const { getInboxEmails } = require('../controllers/inboxController');
const { fetchImapEmails, fetchEmailBody } = require('../controllers/imapController');

router.get('/', getInboxEmails);
router.get('/imap', fetchImapEmails);
router.get('/imap/body/:uid', fetchEmailBody); // On-demand full body fetch

module.exports = router;
