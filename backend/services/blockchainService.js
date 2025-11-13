const {
  getProvider,
  getSigner,
  getDIDRegistryContract,
  getCredentialStoreContract
} = require('../config/blockchainConfig');
const { ethers } = require('ethers');

class BlockchainService {
  constructor() {
    this.provider = getProvider();
    this.signer = getSigner();
    this.didRegistry = getDIDRegistryContract();
    this.credentialStore = getCredentialStoreContract();
  }

  /**
   * Create a DID on blockchain
   * @param {string} metadataHash - IPFS hash of DID metadata
   * @param {string} name - DID name
   * @param {string} ownerAddress - Wallet address of DID owner
   * @returns {Promise<{didId: number, txHash: string}>}
   */
  async createDID(metadataHash, name, ownerAddress) {
    try {
      if (!this.didRegistry) {
        // Mock response for development
        const mockDidId = Math.floor(Math.random() * 1000000);
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        return {
          didId: mockDidId,
          txHash: mockTxHash
        };
      }

      const tx = await this.didRegistry.createDID(metadataHash, name, {
        from: ownerAddress
      });
      const receipt = await tx.wait();

      // Get DID ID from event
      const event = receipt.events?.find(e => e.event === 'DIDCreated');
      const didId = event?.args?.didId?.toNumber() || 0;

      return {
        didId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Blockchain DID creation error:', error);
      throw new Error(`Failed to create DID on blockchain: ${error.message}`);
    }
  }

  /**
   * Get DID information
   * @param {string} ownerAddress - Wallet address
   * @returns {Promise<Object>}
   */
  async getDID(ownerAddress) {
    try {
      if (!this.didRegistry) {
        return null;
      }

      const result = await this.didRegistry.getDID(ownerAddress);
      return {
        didId: result[0].toNumber(),
        metadataHash: result[1],
        name: result[2],
        createdAt: result[3].toNumber()
      };
    } catch (error) {
      console.error('Blockchain DID retrieval error:', error);
      return null;
    }
  }

  /**
   * Store credential on blockchain
   * @param {string} cid - IPFS CID
   * @param {string} hash - Document hash
   * @param {string} issuerAddress - Issuer wallet address
   * @param {string} ownerAddress - Owner wallet address
   * @returns {Promise<{credentialId: number, txHash: string}>}
   */
  async storeCredential(cid, hash, issuerAddress, ownerAddress) {
    try {
      if (!this.credentialStore) {
        // Mock response for development
        const mockCredentialId = Math.floor(Math.random() * 1000000);
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        return {
          credentialId: mockCredentialId,
          txHash: mockTxHash
        };
      }

      const tx = await this.credentialStore.storeCredential(
        cid,
        hash,
        issuerAddress,
        ownerAddress,
        { from: issuerAddress }
      );
      const receipt = await tx.wait();

      // Get credential ID from event
      const event = receipt.events?.find(e => e.event === 'CredentialStored');
      const credentialId = event?.args?.credentialId?.toNumber() || 0;

      return {
        credentialId,
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Blockchain credential storage error:', error);
      throw new Error(`Failed to store credential on blockchain: ${error.message}`);
    }
  }

  /**
   * Verify credential on blockchain
   * @param {string} hash - Document hash
   * @returns {Promise<{isValid: boolean, issuer: string, owner: string, timestamp: number}>}
   */
  async verifyCredential(hash) {
    try {
      if (!this.credentialStore) {
        // Mock response for development
        return {
          isValid: true,
          issuer: '0x0000000000000000000000000000000000000000',
          owner: '0x0000000000000000000000000000000000000000',
          timestamp: Math.floor(Date.now() / 1000)
        };
      }

      const result = await this.credentialStore.verifyCredential(hash);
      return {
        isValid: result[0],
        issuer: result[1],
        owner: result[2],
        timestamp: result[3].toNumber()
      };
    } catch (error) {
      console.error('Blockchain credential verification error:', error);
      return {
        isValid: false,
        issuer: null,
        owner: null,
        timestamp: 0
      };
    }
  }

  /**
   * Revoke credential on blockchain
   * @param {string} hash - Document hash
   * @param {string} issuerAddress - Issuer wallet address
   * @returns {Promise<{txHash: string}>}
   */
  async revokeCredential(hash, issuerAddress) {
    try {
      if (!this.credentialStore) {
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        return { txHash: mockTxHash };
      }

      const tx = await this.credentialStore.revokeCredential(hash, {
        from: issuerAddress
      });
      const receipt = await tx.wait();

      return {
        txHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Blockchain credential revocation error:', error);
      throw new Error(`Failed to revoke credential on blockchain: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>}
   */
  async getTransaction(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now() // Would need to get from block
      };
    } catch (error) {
      console.error('Transaction retrieval error:', error);
      return null;
    }
  }
}

module.exports = new BlockchainService();

