import axios from 'axios';

// IPFS Configuration
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY || 'your_pinata_api_key';
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY || 'your_pinata_secret_key';
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Alternative IPFS gateways
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

// IPFS utility functions
export const ipfsUtils = {
  // Upload file to IPFS via Pinata
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          category: metadata.category || 'document',
          uploadedBy: metadata.owner || 'unknown',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
      formData.append('pinataMetadata', pinataMetadata);
      
      // Pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            { id: 'FRA1', desiredReplicationCount: 1 },
            { id: 'NYC1', desiredReplicationCount: 2 }
          ]
        }
      });
      formData.append('pinataOptions', pinataOptions);
      
      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          }
        }
      );
      
      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        url: `${IPFS_GATEWAY}${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      
      // Fallback to mock upload for development
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpload(file, metadata);
      }
      
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  },

  // Upload JSON data to IPFS
  async uploadJSON(data, metadata = {}) {
    let file;
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      file = new File([blob], metadata.name || 'data.json', { type: 'application/json' });
      
      return await this.uploadFile(file, metadata);
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      
      // Fallback to mock upload for development
      if (process.env.NODE_ENV === 'development' && file) {
        return this.mockUpload(file, metadata);
      }
      
      throw new Error(`JSON upload failed: ${error.message}`);
    }
  },

  // Retrieve file from IPFS
  async getFile(ipfsHash, gatewayIndex = 0) {
    try {
      const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
      const url = `${gateway}${ipfsHash}`;
      
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        responseType: 'blob'
      });
      
      return {
        success: true,
        data: response.data,
        url: url,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error(`Error fetching from gateway ${gatewayIndex}:`, error);
      
      // Try next gateway if available
      if (gatewayIndex < IPFS_GATEWAYS.length - 1) {
        return await this.getFile(ipfsHash, gatewayIndex + 1);
      }
      
      throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
    }
  },

  // Retrieve JSON data from IPFS
  async getJSON(ipfsHash) {
    try {
      const result = await this.getFile(ipfsHash);
      const text = await result.data.text();
      const jsonData = JSON.parse(text);
      
      return {
        success: true,
        data: jsonData,
        url: result.url
      };
    } catch (error) {
      console.error('Error retrieving JSON from IPFS:', error);
      throw new Error(`JSON retrieval failed: ${error.message}`);
    }
  },

  // Check if IPFS hash is valid
  isValidIPFSHash(hash) {
    // Basic IPFS hash validation
    const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidV1Regex = /^b[a-z2-7]{58}$/;
    
    return ipfsHashRegex.test(hash) || cidV1Regex.test(hash);
  },

  // Get file info from Pinata
  async getFileInfo(ipfsHash) {
    try {
      const response = await axios.get(
        `${PINATA_BASE_URL}/data/pinList?hashContains=${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          }
        }
      );
      
      const pins = response.data.rows;
      if (pins.length > 0) {
        const pin = pins[0];
        return {
          success: true,
          ipfsHash: pin.ipfs_pin_hash,
          size: pin.size,
          timestamp: pin.date_pinned,
          metadata: pin.metadata
        };
      }
      
      return { success: false, message: 'File not found' };
    } catch (error) {
      console.error('Error getting file info:', error);
      return { success: false, error: error.message };
    }
  },

  // Mock upload for development/testing
  mockUpload(file, metadata = {}) {
    console.log('Using mock IPFS upload for development');
    
    // Generate a mock IPFS hash
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return Promise.resolve({
      success: true,
      ipfsHash: mockHash,
      pinSize: file.size,
      timestamp: new Date().toISOString(),
      url: `${IPFS_GATEWAY}${mockHash}`,
      mock: true
    });
  },

  // Generate IPFS URL from hash
  getIPFSUrl(ipfsHash, gatewayIndex = 0) {
    const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
    return `${gateway}${ipfsHash}`;
  },

  // Pin existing IPFS hash to Pinata
  async pinByHash(ipfsHash, metadata = {}) {
    try {
      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinByHash`,
        {
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: metadata.name || ipfsHash,
            keyvalues: metadata
          }
        },
        {
          headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY
          }
        }
      );
      
      return {
        success: true,
        ipfsHash: response.data.ipfsHash,
        pinSize: response.data.pinSize,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Error pinning hash:', error);
      throw new Error(`Pin by hash failed: ${error.message}`);
    }
  }
};

// Configuration helper
export const configureIPFS = (apiKey, secretKey) => {
  if (apiKey && secretKey) {
    process.env.REACT_APP_PINATA_API_KEY = apiKey;
    process.env.REACT_APP_PINATA_SECRET_KEY = secretKey;
  }
};

// Export default
export default ipfsUtils;
