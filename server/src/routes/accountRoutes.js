const express = require('express');
const router = express.Router();
const { addAccount, getAccounts, deleteAccount } = require('../controllers/accountController');

router.post('/', addAccount);
router.get('/', getAccounts);
router.delete('/:id', deleteAccount);

module.exports = router;
