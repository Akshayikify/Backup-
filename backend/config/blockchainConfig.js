const { ethers } = require('ethers');
require('dotenv').config();

// Blockchain Configuration
const BLOCKCHAIN_CONFIG = {
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  networkId: process.env.NETWORK_ID || 1337,
  privateKey: process.env.PRIVATE_KEY || '',
  didRegistryAddress: process.env.DID_REGISTRY_ADDRESS || '',
  credentialStoreAddress: process.env.CREDENTIAL_STORE_ADDRESS || ''
};

// Provider and Signer
let provider = null;
let signer = null;

const getProvider = () => {
  if (!provider) {
    try {
      provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);
      console.log('✅ Blockchain provider initialized');
    } catch (error) {
      console.error('❌ Blockchain provider initialization error:', error);
      // Mock provider for development
      provider = {
        getNetwork: async () => ({ chainId: 1337 }),
        getBlockNumber: async () => 0,
        getTransaction: async () => null,
        getTransactionReceipt: async () => null
      };
      console.log('⚠️  Using mock blockchain provider');
    }
  }
  return provider;
};

const getSigner = () => {
  if (!signer && BLOCKCHAIN_CONFIG.privateKey) {
    try {
      const provider = getProvider();
      signer = new ethers.Wallet(BLOCKCHAIN_CONFIG.privateKey, provider);
      console.log('✅ Blockchain signer initialized');
    } catch (error) {
      console.error('❌ Blockchain signer initialization error:', error);
    }
  }
  return signer;
};

// Contract ABIs (simplified - should be loaded from build artifacts)
const DID_REGISTRY_ABI = [
  "function createDID(string memory metadataHash, string memory name) public returns (uint256)",
  "function getDID(address owner) public view returns (uint256, string memory, string memory, uint256)",
  "event DIDCreated(address indexed owner, uint256 indexed didId, string metadataHash)"
];

const CREDENTIAL_STORE_ABI = [
  "function storeCredential(string memory cid, string memory hash, address issuer, address owner) public returns (uint256)",
  "function verifyCredential(string memory hash) public view returns (bool, address, address, uint256)",
  "function revokeCredential(string memory hash) public",
  "event CredentialStored(uint256 indexed credentialId, string cid, string hash, address issuer, address owner)",
  "event CredentialRevoked(string indexed hash)"
];

const getDIDRegistryContract = () => {
  if (!BLOCKCHAIN_CONFIG.didRegistryAddress) {
    return null;
  }
  const provider = getProvider();
  const signer = getSigner();
  const contract = new ethers.Contract(
    BLOCKCHAIN_CONFIG.didRegistryAddress,
    DID_REGISTRY_ABI,
    signer || provider
  );
  return contract;
};

const getCredentialStoreContract = () => {
  if (!BLOCKCHAIN_CONFIG.credentialStoreAddress) {
    return null;
  }
  const provider = getProvider();
  const signer = getSigner();
  const contract = new ethers.Contract(
    BLOCKCHAIN_CONFIG.credentialStoreAddress,
    CREDENTIAL_STORE_ABI,
    signer || provider
  );
  return contract;
};

module.exports = {
  BLOCKCHAIN_CONFIG,
  getProvider,
  getSigner,
  getDIDRegistryContract,
  getCredentialStoreContract,
  DID_REGISTRY_ABI,
  CREDENTIAL_STORE_ABI
};

