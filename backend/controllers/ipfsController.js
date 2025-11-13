const multer = require('multer');
const ipfsService = require('../services/ipfsService');
const cryptoService = require('../services/cryptoService');
const blockchainService = require('../services/blockchainService');
const credentialController = require('./credentialController');
const Log = require('../models/Log');
const asyncHandler = require('../utils/asyncHandler');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and TXT files are allowed.'));
    }
  }
});

/**
 * Upload file to IPFS
 * POST /api/ipfs/upload
 * POST /upload (legacy)
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No file provided'
    });
  }

  const walletAddress = req.body.wallet_address || req.body.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({
      status: 'error',
      message: 'Wallet address is required'
    });
  }

  try {
    // Generate file hash
    const fileHash = cryptoService.generateFileHash(req.file.buffer);

    // Upload to IPFS
    const ipfsResult = await ipfsService.uploadFile(req.file.buffer, {
      name: req.file.originalname,
      contentType: req.file.mimetype,
      uploadedBy: walletAddress.toLowerCase()
    });

    // Log event
    await Log.create({
      eventType: 'ipfs_upload',
      walletAddress: walletAddress.toLowerCase(),
      cid: ipfsResult.cid,
      hash: fileHash,
      details: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      },
      success: true
    });

    // Store credential on blockchain and get real transaction hash
    let txHash;
    let credentialId = null;
    try {
      // Store the credential on blockchain
      // Using walletAddress as both issuer and owner for user-uploaded documents
      const blockchainResult = await blockchainService.storeCredential(
        ipfsResult.cid,
        fileHash,
        walletAddress.toLowerCase(),
        walletAddress.toLowerCase()
      );
      
      txHash = blockchainResult.txHash;
      credentialId = blockchainResult.credentialId;
      
      console.log('✅ Document stored on blockchain:', {
        credentialId,
        txHash,
        cid: ipfsResult.cid
      });
    } catch (blockchainError) {
      console.warn('⚠️  Blockchain storage failed, using mock transaction hash:', blockchainError.message);
      // Fallback to mock transaction hash if blockchain fails
      txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    }

    // Get all gateway URLs for true decentralization
    const allGateways = ipfsService.getAllGatewayUrls(ipfsResult.cid);

    res.json({
      status: 'success',
      data: {
        filename: req.file.originalname,
        ipfs_url: ipfsResult.cid,
        ipfsHash: ipfsResult.cid,
        cid: ipfsResult.cid,
        hash: fileHash,
        tx_hash: txHash,
        credentialId: credentialId,
        size: ipfsResult.size || req.file.size,
        gatewayUrl: ipfsService.getGatewayUrl(ipfsResult.cid),
        // Show all available gateways (true decentralization)
        allGateways: allGateways,
        decentralized: true, // Document is on IPFS network
        accessibleFrom: 'Any IPFS node or gateway worldwide',
        blockchainStored: !!credentialId // Indicates if stored on blockchain
      }
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    
    // Log error
    await Log.create({
      eventType: 'ipfs_upload',
      walletAddress: walletAddress?.toLowerCase() || 'unknown',
      details: { fileName: req.file?.originalname },
      success: false,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload file to IPFS'
    });
  }
});

/**
 * Get file from IPFS
 * GET /api/ipfs/:cid
 */
const getFile = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  try {
    const fileBuffer = await ipfsService.getFile(cid);
    
    // Log event
    await Log.create({
      eventType: 'ipfs_download',
      cid,
      success: true
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${cid}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve file from IPFS'
    });
  }
});

module.exports = {
  uploadFile: [upload.single('file'), uploadFile],
  getFile
};

