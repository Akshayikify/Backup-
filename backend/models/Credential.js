const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
  credentialId: {
    type: Number,
    unique: true,
    sparse: true
  },
  cid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ipfsHash: {
    type: String,
    required: true,
    index: true
  },
  txHash: {
    type: String,
    index: true
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  issuer: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['certificate', 'diploma', 'license', 'identity', 'other'],
    default: 'other'
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
credentialSchema.index({ owner: 1, createdAt: -1 });
credentialSchema.index({ issuer: 1, status: 1 });
credentialSchema.index({ cid: 1 });
credentialSchema.index({ hash: 1 });

// Methods
credentialSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

credentialSchema.methods.revoke = function() {
  this.status = 'revoked';
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Credential', credentialSchema);

