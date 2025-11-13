const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  did: {
    type: String,
    unique: true,
    sparse: true
  },
  didId: {
    type: Number
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  organization: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'verifier', 'issuer'],
    default: 'user'
  },
  metadataHash: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ walletAddress: 1 });
userSchema.index({ did: 1 });

// Methods
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

