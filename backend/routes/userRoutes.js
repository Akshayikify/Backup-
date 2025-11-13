const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get user by wallet address
router.get('/:walletAddress', userController.getUser);

// Get user statistics
router.get('/:walletAddress/stats', userController.getUserStats);

// Create or update user
router.post('/', userController.createOrUpdateUser);

module.exports = router;

