const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getSystemStats } = require('../controllers/adminController');

// In a real app, use middleware like verifyAdmin (jwt check + role) here
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

module.exports = router;
