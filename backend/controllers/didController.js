const didService = require('../services/didService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new DID
 * POST /api/did/create
 */
const createDID = asyncHandler(async (req, res) => {
  const { walletAddress, name, email, organization } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      status: 'error',
      message: 'Wallet address is required'
    });
  }

  if (!name) {
    return res.status(400).json({
      status: 'error',
      message: 'Name is required'
    });
  }

  const result = await didService.createDID(walletAddress, {
    name,
    email,
    organization
  });

  res.status(201).json({
    status: 'success',
    data: result
  });
});

/**
 * Get DID by wallet address
 * GET /api/did/:walletAddress
 */
const getDID = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const did = await didService.getDID(walletAddress);

  if (!did) {
    return res.status(404).json({
      status: 'error',
      message: 'DID not found'
    });
  }

  res.json({
    status: 'success',
    data: did
  });
});

module.exports = {
  createDID,
  getDID
};

