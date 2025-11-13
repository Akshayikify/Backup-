const express = require('express');
const router = express.Router();
const ipfsController = require('../controllers/ipfsController');

// Upload file to IPFS
router.post('/upload', ipfsController.uploadFile);

// Legacy upload endpoint
router.post('/', ipfsController.uploadFile);

// Get file from IPFS
router.get('/:cid', ipfsController.getFile);

module.exports = router;

