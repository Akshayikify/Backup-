const express = require('express');
const router = express.Router();
const didController = require('../controllers/didController');

// Create DID
router.post('/create', didController.createDID);

// Get DID by wallet address
router.get('/:walletAddress', didController.getDID);

module.exports = router;

