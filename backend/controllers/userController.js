const User = require('../models/User');
const Credential = require('../models/Credential');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get user by wallet address
 * GET /api/user/:walletAddress
 */
const getUser = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  // Get user credentials count
  const credentialsCount = await Credential.countDocuments({
    owner: walletAddress.toLowerCase(),
    status: 'active'
  });

  res.json({
    status: 'success',
    data: {
      ...user.toJSON(),
      credentialsCount
    }
  });
});

/**
 * Get user statistics
 * GET /api/user/:walletAddress/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { walletAddress } = req.params;

  const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }

  const totalDocuments = await Credential.countDocuments({
    owner: walletAddress.toLowerCase()
  });

  const verifiedDocuments = await Credential.countDocuments({
    owner: walletAddress.toLowerCase(),
    verified: true,
    status: 'active'
  });

  const recentActivity = await Credential.find({
    owner: walletAddress.toLowerCase()
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select('title category createdAt');

  res.json({
    status: 'success',
    data: {
      totalDocuments,
      verifiedDocuments,
      recentActivity: recentActivity.map(doc => ({
        id: doc._id,
        action: 'Document uploaded',
        document: doc.title,
        time: doc.createdAt
      }))
    }
  });
});

/**
 * Create or update user
 * POST /api/user
 */
const createOrUpdateUser = asyncHandler(async (req, res) => {
  const { walletAddress, name, email, organization, role } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      status: 'error',
      message: 'Wallet address is required'
    });
  }

  let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

  if (user) {
    // Update existing user
    if (name) user.name = name;
    if (email) user.email = email;
    if (organization) user.organization = organization;
    if (role) user.role = role;
    user.updatedAt = new Date();
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      organization,
      role: role || 'user'
    });
  }

  res.json({
    status: 'success',
    data: user.toJSON()
  });
});

module.exports = {
  getUser,
  getUserStats,
  createOrUpdateUser
};

