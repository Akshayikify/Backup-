const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['did_created', 'credential_issued', 'credential_verified', 'credential_revoked', 'ipfs_upload', 'ipfs_download'],
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  credentialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  },
  cid: {
    type: String,
    index: true
  },
  hash: {
    type: String,
    index: true
  },
  txHash: {
    type: String,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  error: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
logSchema.index({ eventType: 1, timestamp: -1 });
logSchema.index({ walletAddress: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

// Methods
logSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Log', logSchema);

