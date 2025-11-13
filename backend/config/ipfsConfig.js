// IPFS Configuration
const IPFS_CONFIG = {
  // Local IPFS node
  local: {
    host: process.env.IPFS_HOST || '127.0.0.1',
    port: process.env.IPFS_PORT || 5001,
    protocol: 'http'
  },
  // Pinata configuration (if using Pinata)
  pinata: {
    apiKey: process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY,
    gateway: process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/'
  }
};

// Create IPFS client - using mock client (Pinata API is used directly in ipfsService)
let ipfsClient = null;

const getIPFSClient = () => {
  if (ipfsClient) {
    return ipfsClient;
  }

  // Use mock IPFS client for development
  // Real IPFS operations are handled via Pinata API in ipfsService
  console.log('⚠️  Using mock IPFS client (Pinata API used directly for uploads)');
  
  ipfsClient = {
    add: async (data) => {
      // Generate a realistic mock IPFS hash
      const randomPart1 = Math.random().toString(36).substring(2, 15);
      const randomPart2 = Math.random().toString(36).substring(2, 15);
      const randomPart3 = Math.random().toString(36).substring(2, 15);
      const mockHash = `Qm${randomPart1}${randomPart2}${randomPart3}`;
      return { 
        path: mockHash, 
        cid: mockHash,
        size: Buffer.isBuffer(data) ? data.length : (typeof data === 'string' ? data.length : 0)
      };
    },
    cat: async (hash) => {
      throw new Error('IPFS retrieval not available. Use Pinata gateway URL to access files.');
    }
  };
  
  return ipfsClient;
};

module.exports = {
  IPFS_CONFIG,
  getIPFSClient
};

