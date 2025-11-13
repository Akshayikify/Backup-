import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with your deployed contract address

// Contract ABI - Replace with your actual contract ABI
export const CONTRACT_ABI = [
  // DID Management
  "function createDID(string memory metadataHash, string memory name) public returns (uint256)",
  "function getDID(address owner) public view returns (uint256, string memory, string memory, uint256)",
  "function updateDID(string memory metadataHash) public",
  
  // Document Management
  "function storeDocument(string memory ipfsHash, string memory title, string memory category) public returns (uint256)",
  "function getDocument(uint256 documentId) public view returns (string memory, string memory, string memory, address, uint256)",
  "function getUserDocuments(address user) public view returns (uint256[] memory)",
  
  // Verification
  "function verifyDocument(uint256 documentId) public view returns (bool)",
  "function isDocumentOwner(uint256 documentId, address user) public view returns (bool)",
  
  // Events
  "event DIDCreated(address indexed owner, uint256 indexed didId, string metadataHash)",
  "event DIDUpdated(address indexed owner, string metadataHash)",
  "event DocumentStored(address indexed owner, uint256 indexed documentId, string ipfsHash)",
  "event DocumentVerified(uint256 indexed documentId, address indexed verifier)"
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  chainName: "Sepolia Test Network",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "SEP",
    decimals: 18
  },
  rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_KEY"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

// Get provider and signer
export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = () => {
  const provider = getProvider();
  return provider.getSigner();
};

// Get contract instance
export const getContract = () => {
  const signer = getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Contract interaction functions
export const contractFunctions = {
  // DID Functions
  async createDID(metadataHash, name) {
    try {
      const contract = getContract();
      const tx = await contract.createDID(metadataHash, name);
      const receipt = await tx.wait();
      
      // Extract DID ID from event logs
      const event = receipt.events?.find(e => e.event === 'DIDCreated');
      const didId = event?.args?.didId;
      
      return {
        success: true,
        txHash: tx.hash,
        didId: didId?.toString(),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error creating DID:', error);
      throw new Error(`Failed to create DID: ${error.message}`);
    }
  },

  async getDID(address) {
    try {
      const contract = getContract();
      const result = await contract.getDID(address);
      
      return {
        didId: result[0].toString(),
        metadataHash: result[1],
        name: result[2],
        createdAt: result[3].toString()
      };
    } catch (error) {
      console.error('Error getting DID:', error);
      return null;
    }
  },

  // Document Functions
  async storeDocument(ipfsHash, title, category) {
    try {
      const contract = getContract();
      const tx = await contract.storeDocument(ipfsHash, title, category);
      const receipt = await tx.wait();
      
      // Extract document ID from event logs
      const event = receipt.events?.find(e => e.event === 'DocumentStored');
      const documentId = event?.args?.documentId;
      
      return {
        success: true,
        txHash: tx.hash,
        documentId: documentId?.toString(),
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error storing document:', error);
      throw new Error(`Failed to store document: ${error.message}`);
    }
  },

  async getDocument(documentId) {
    try {
      const contract = getContract();
      const result = await contract.getDocument(documentId);
      
      return {
        ipfsHash: result[0],
        title: result[1],
        category: result[2],
        owner: result[3],
        createdAt: result[4].toString()
      };
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  },

  async getUserDocuments(userAddress) {
    try {
      const contract = getContract();
      const documentIds = await contract.getUserDocuments(userAddress);
      
      // Get details for each document
      const documents = await Promise.all(
        documentIds.map(async (id) => {
          const doc = await this.getDocument(id.toString());
          return { id: id.toString(), ...doc };
        })
      );
      
      return documents.filter(doc => doc !== null);
    } catch (error) {
      console.error('Error getting user documents:', error);
      return [];
    }
  },

  // Verification Functions
  async verifyDocument(documentId) {
    try {
      const contract = getContract();
      const isValid = await contract.verifyDocument(documentId);
      
      return {
        isValid,
        documentId,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying document:', error);
      return { isValid: false, error: error.message };
    }
  }
};

// Network helper functions
export const switchToNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.utils.hexValue(NETWORK_CONFIG.chainId) }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch network');
    }
  }
};

export const checkNetwork = async () => {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return network.chainId === NETWORK_CONFIG.chainId;
};

// Event listeners
export const setupEventListeners = (contract, callbacks = {}) => {
  if (callbacks.onDIDCreated) {
    contract.on('DIDCreated', callbacks.onDIDCreated);
  }
  
  if (callbacks.onDocumentStored) {
    contract.on('DocumentStored', callbacks.onDocumentStored);
  }
  
  if (callbacks.onDocumentVerified) {
    contract.on('DocumentVerified', callbacks.onDocumentVerified);
  }
};

export const removeEventListeners = (contract) => {
  contract.removeAllListeners();
};
