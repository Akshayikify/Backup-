const Credential = require('../models/Credential');
const Log = require('../models/Log');
const blockchainService = require('../services/blockchainService');
const cryptoService = require('../services/cryptoService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Issue a new credential
 * POST /api/credential/issue
 */
const issueCredential = asyncHandler(async (req, res) => {
  const {
    cid,
    ipfsHash,
    issuer,
    owner,
    title,
    description,
    category,
    fileName,
    fileSize,
    fileType,
    hash
  } = req.body;

  // Validate required fields
  if (!cid || !hash || !issuer || !owner || !title) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: cid, hash, issuer, owner, title'
    });
  }

  // Store on blockchain
  let blockchainResult;
  try {
    blockchainResult = await blockchainService.storeCredential(
      cid,
      hash,
      issuer.toLowerCase(),
      owner.toLowerCase()
    );
  } catch (error) {
    console.error('Blockchain storage error:', error);
    // Continue without blockchain for development
    blockchainResult = {
      credentialId: Math.floor(Math.random() * 1000000),
      txHash: `0x${Math.random().toString(16).substring(2, 66)}`
    };
  }

  // Create credential in database
  const credential = await Credential.create({
    credentialId: blockchainResult.credentialId,
    cid,
    ipfsHash: ipfsHash || cid,
    txHash: blockchainResult.txHash,
    hash,
    issuer: issuer.toLowerCase(),
    owner: owner.toLowerCase(),
    title,
    description,
    category: category || 'other',
    fileName,
    fileSize,
    fileType,
    status: 'active',
    verified: true
  });

  // Log event
  await Log.create({
    eventType: 'credential_issued',
    walletAddress: issuer.toLowerCase(),
    credentialId: credential._id,
    cid,
    hash,
    txHash: blockchainResult.txHash,
    details: { title, category },
    success: true
  });

  res.status(201).json({
    status: 'success',
    data: credential.toJSON()
  });
});

/**
 * Verify a credential
 * POST /api/credential/verify
 */
const verifyCredential = asyncHandler(async (req, res) => {
  const { cid, hash, txHash } = req.body;

  if (!cid && !hash && !txHash) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide either cid, hash, or txHash'
    });
  }

  let credential = null;
  let blockchainData = null;

  // Find credential in database
  if (hash) {
    credential = await Credential.findOne({ hash });
  } else if (cid) {
    credential = await Credential.findOne({ cid });
  } else if (txHash) {
    credential = await Credential.findOne({ txHash });
  }

  // Verify on blockchain
  if (hash) {
    blockchainData = await blockchainService.verifyCredential(hash);
  } else if (txHash) {
    blockchainData = await blockchainService.getTransaction(txHash);
  }

  const isValid = credential && credential.status === 'active' && 
                  (blockchainData?.isValid !== false);

  // Log verification
  await Log.create({
    eventType: 'credential_verified',
    walletAddress: credential?.owner || 'unknown',
    credentialId: credential?._id,
    cid: credential?.cid || cid,
    hash: credential?.hash || hash,
    txHash: credential?.txHash || txHash,
    details: { isValid },
    success: isValid
  });

  res.json({
    status: 'success',
    data: {
      isValid,
      credential: credential ? credential.toJSON() : null,
      blockchainData
    }
  });
});

/**
 * Get credential by ID
 * GET /api/credential/:id
 */
const getCredential = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const credential = await Credential.findById(id);

  if (!credential) {
    return res.status(404).json({
      status: 'error',
      message: 'Credential not found'
    });
  }

  res.json({
    status: 'success',
    data: credential.toJSON()
  });
});

/**
 * Get credentials by owner
 * GET /api/credential/owner/:walletAddress
 */
const getCredentialsByOwner = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const credentials = await Credential.find({
    owner: walletAddress.toLowerCase()
  }).sort({ createdAt: -1 });

  res.json({
    status: 'success',
    count: credentials.length,
    data: credentials.map(c => c.toJSON())
  });
});

/**
 * Revoke a credential
 * POST /api/credential/revoke
 */
const revokeCredential = asyncHandler(async (req, res) => {
  const { hash, issuer } = req.body;

  if (!hash || !issuer) {
    return res.status(400).json({
      status: 'error',
      message: 'Hash and issuer are required'
    });
  }

  const credential = await Credential.findOne({ hash });

  if (!credential) {
    return res.status(404).json({
      status: 'error',
      message: 'Credential not found'
    });
  }

  if (credential.issuer.toLowerCase() !== issuer.toLowerCase()) {
    return res.status(403).json({
      status: 'error',
      message: 'Only the issuer can revoke this credential'
    });
  }

  // Revoke on blockchain
  try {
    await blockchainService.revokeCredential(hash, issuer);
  } catch (error) {
    console.error('Blockchain revocation error:', error);
  }

  // Update in database
  await credential.revoke();

  // Log event
  await Log.create({
    eventType: 'credential_revoked',
    walletAddress: issuer.toLowerCase(),
    credentialId: credential._id,
    hash,
    details: { title: credential.title },
    success: true
  });

  res.json({
    status: 'success',
    data: credential.toJSON()
  });
});

module.exports = {
  issueCredential,
  verifyCredential,
  getCredential,
  getCredentialsByOwner,
  revokeCredential
};

