const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');

// Issue credential
router.post('/issue', credentialController.issueCredential);

// Verify credential
router.post('/verify', credentialController.verifyCredential);

// Get credential by ID
router.get('/:id', credentialController.getCredential);

// Get credentials by owner
router.get('/owner/:walletAddress', credentialController.getCredentialsByOwner);

// Revoke credential
router.post('/revoke', credentialController.revokeCredential);

module.exports = router;

