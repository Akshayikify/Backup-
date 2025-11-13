const { getIPFSClient, IPFS_CONFIG } = require('../config/ipfsConfig');
const axios = require('axios');
let FormData;
try {
  FormData = require('form-data');
} catch (e) {
  // FormData will be undefined if not installed
  console.warn('form-data package not found. Pinata uploads will not work.');
}

class IPFSService {
  constructor() {
    this.client = getIPFSClient();
    this.pinataApiKey = IPFS_CONFIG.pinata.apiKey;
    this.pinataSecretKey = IPFS_CONFIG.pinata.secretKey;
    this.useLocalIPFS = process.env.USE_LOCAL_IPFS === 'true';
  }

  /**
   * Upload file to IPFS
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} metadata - File metadata
   * @returns {Promise<{cid: string, path: string, size: number}>}
   */
  async uploadFile(fileBuffer, metadata = {}) {
    try {
      // Option 1: Use local IPFS node (truly decentralized)
      if (this.useLocalIPFS && this.client && typeof this.client.add === 'function') {
        try {
          const result = await this.client.add(fileBuffer, {
            pin: true, // Pin to local node to prevent garbage collection
            ...metadata
          });

          // Also pin to Pinata as backup if configured
          if (this.pinataApiKey && this.pinataSecretKey) {
            try {
              await this.uploadToPinata(fileBuffer, metadata);
              console.log('✅ Also pinned to Pinata as backup');
            } catch (pinataError) {
              console.warn('⚠️  Pinata backup failed, but local IPFS upload succeeded');
            }
          }

          return {
            cid: result.cid?.toString() || result.path,
            path: result.path,
            size: result.size || fileBuffer.length
          };
        } catch (localError) {
          console.warn('⚠️  Local IPFS upload failed, falling back to Pinata:', localError.message);
        }
      }

      // Option 2: Use Pinata (centralized but reliable)
      if (this.pinataApiKey && this.pinataSecretKey) {
        return await this.uploadToPinata(fileBuffer, metadata);
      }

      // Option 3: Fallback to mock (development only)
      const result = await this.client.add(fileBuffer, {
        pin: true,
        ...metadata
      });

      return {
        cid: result.cid?.toString() || result.path,
        path: result.path,
        size: result.size || fileBuffer.length
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload to Pinata (Centralized IPFS Pinning Service)
   * Note: This is NOT fully decentralized, but provides reliability
   */
  async uploadToPinata(fileBuffer, metadata = {}) {
    if (!FormData) {
      throw new Error('form-data package is required for Pinata uploads');
    }
    
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: metadata.name || 'file',
        contentType: metadata.contentType || 'application/octet-stream'
      });

      const pinataMetadata = JSON.stringify({
        name: metadata.name || 'Document',
        keyvalues: {
          category: metadata.category || 'document',
          uploadedBy: metadata.uploadedBy || 'unknown',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        // Enable replication across multiple regions for better availability
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 1 },
            { id: 'NYC1', desiredReplicationCount: 1 }
          ]
        }
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
            ...formData.getHeaders()
          }
        }
      );

      return {
        cid: response.data.IpfsHash,
        path: response.data.IpfsHash,
        size: response.data.PinSize
      };
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  /**
   * Retrieve file from IPFS
   * Works with any IPFS gateway or node
   * @param {string} cid - IPFS CID
   * @returns {Promise<Buffer>}
   */
  async getFile(cid) {
    try {
      // Try local IPFS node first
      if (this.useLocalIPFS && this.client && typeof this.client.cat === 'function') {
        try {
          const chunks = [];
          for await (const chunk of this.client.cat(cid)) {
            chunks.push(chunk);
          }
          return Buffer.concat(chunks);
        } catch (localError) {
          console.warn('⚠️  Local IPFS retrieval failed, trying gateway:', localError.message);
        }
      }

      // Fallback to public IPFS gateway (decentralized access)
      const gateways = [
        'https://ipfs.io/ipfs/',
        'https://gateway.pinata.cloud/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://dweb.link/ipfs/'
      ];

      for (const gateway of gateways) {
        try {
          const response = await axios.get(`${gateway}${cid}`, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          return Buffer.from(response.data);
        } catch (error) {
          console.warn(`Gateway ${gateway} failed, trying next...`);
          continue;
        }
      }

      throw new Error('All IPFS gateways failed');
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  }

  /**
   * Get IPFS gateway URL
   * Returns multiple gateway options for redundancy
   */
  getGatewayUrl(cid) {
    // Return primary gateway, but document can be accessed from any gateway
    const gateway = IPFS_CONFIG.pinata.gateway || 'https://gateway.pinata.cloud/ipfs/';
    return `${gateway}${cid}`;
  }

  /**
   * Get all available gateway URLs for a CID
   * This shows true decentralization - same content accessible from multiple sources
   */
  getAllGatewayUrls(cid) {
    return {
      primary: `https://gateway.pinata.cloud/ipfs/${cid}`,
      public: [
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://dweb.link/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`
      ],
      ipfsProtocol: `ipfs://${cid}` // For IPFS-enabled browsers
    };
  }

  /**
   * Pin existing hash to IPFS (Pinata)
   */
  async pinHash(cid, metadata = {}) {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata credentials not configured');
    }

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: cid,
          pinataMetadata: {
            name: metadata.name || cid,
            keyvalues: metadata
          }
        },
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return {
        cid: response.data.ipfsHash,
        success: true
      };
    } catch (error) {
      console.error('Pinata pin error:', error);
      throw new Error(`Failed to pin hash: ${error.message}`);
    }
  }
}

module.exports = new IPFSService();
