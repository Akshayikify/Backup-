const blockchainService = require('./blockchainService');
const ipfsService = require('./ipfsService');
const User = require('../models/User');
const Log = require('../models/Log');

class DIDService {
  /**
   * Create a new DID
   * @param {string} walletAddress - Wallet address
   * @param {Object} didData - DID data (name, email, organization)
   * @returns {Promise<Object>}
   */
  async createDID(walletAddress, didData) {
    try {
      // Check if DID already exists
      let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      
      if (user && user.did) {
        throw new Error('DID already exists for this wallet address');
      }

      // Create metadata
      const metadata = {
        name: didData.name,
        email: didData.email,
        organization: didData.organization,
        walletAddress: walletAddress.toLowerCase(),
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      // Upload metadata to IPFS
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));
      const ipfsResult = await ipfsService.uploadFile(metadataBuffer, {
        name: `did_${walletAddress}.json`,
        contentType: 'application/json'
      });

      // Create DID on blockchain
      const blockchainResult = await blockchainService.createDID(
        ipfsResult.cid,
        didData.name,
        walletAddress
      );

      // Create DID string (using did:ethr format)
      const did = `did:ethr:${walletAddress}`;

      // Save to database
      if (user) {
        user.did = did;
        user.didId = blockchainResult.didId;
        user.name = didData.name;
        user.email = didData.email;
        user.organization = didData.organization;
        user.metadataHash = ipfsResult.cid;
        await user.save();
      } else {
        user = await User.create({
          walletAddress: walletAddress.toLowerCase(),
          did: did,
          didId: blockchainResult.didId,
          name: didData.name,
          email: didData.email,
          organization: didData.organization,
          metadataHash: ipfsResult.cid
        });
      }

      // Log event
      await Log.create({
        eventType: 'did_created',
        walletAddress: walletAddress.toLowerCase(),
        cid: ipfsResult.cid,
        txHash: blockchainResult.txHash,
        details: { didId: blockchainResult.didId, name: didData.name },
        success: true
      });

      return {
        did: did,
        didId: blockchainResult.didId,
        metadataHash: ipfsResult.cid,
        txHash: blockchainResult.txHash,
        user: user.toJSON()
      };
    } catch (error) {
      console.error('DID creation error:', error);
      throw error;
    }
  }

  /**
   * Get DID by wallet address
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object|null>}
   */
  async getDID(walletAddress) {
    try {
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      
      if (!user || !user.did) {
        return null;
      }

      // Get blockchain data
      const blockchainData = await blockchainService.getDID(walletAddress);

      return {
        did: user.did,
        didId: user.didId,
        metadataHash: user.metadataHash,
        name: user.name,
        email: user.email,
        organization: user.organization,
        blockchainData: blockchainData,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('DID retrieval error:', error);
      return null;
    }
  }
}

module.exports = new DIDService();

