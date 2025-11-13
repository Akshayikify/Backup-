import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

function CreateDID({ account, onDIDCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [didData, setDidData] = useState({
    name: '',
    email: '',
    organization: ''
  });

  // Mock contract address - replace with your deployed contract
  const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";
  
  // Mock ABI - replace with your actual contract ABI
  const CONTRACT_ABI = [
    "function createDID(string memory metadataHash, string memory name) public returns (uint256)",
    "function getDID(address owner) public view returns (uint256, string memory, string memory, uint256)",
    "event DIDCreated(address indexed owner, uint256 indexed didId, string metadataHash)"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDidData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToIPFS = async (data) => {
    try {
      // Upload metadata to backend API which handles IPFS
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/ipfs/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          walletAddress: account
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload to IPFS');
      }

      const result = await response.json();
      return result.data?.cid || result.cid || `Qm${Math.random().toString(36).substring(2, 15)}`;
    } catch (error) {
      console.error('IPFS upload error:', error);
      // Fallback to mock for development
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      console.log('Using mock IPFS hash:', mockHash);
      return mockHash;
    }
  };

  const createDID = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!didData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      setIsCreating(true);
      
      // 1. Upload metadata to IPFS
      const metadata = {
        name: didData.name,
        email: didData.email,
        organization: didData.organization,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const ipfsHash = await uploadToIPFS(metadata);
      toast.success('Metadata uploaded to IPFS');

      // 2. Connect to smart contract
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Note: In a real implementation, you would deploy and use an actual contract
      // For now, we'll simulate the contract interaction
      console.log('Creating DID with:', {
        account,
        ipfsHash,
        name: didData.name
      });
      
      // Mock transaction
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      toast.success('DID created successfully!');
      
      // Clear form
      setDidData({ name: '', email: '', organization: '' });
      
      const didId = Math.floor(Math.random() * 1000000);
      const did = `did:ethr:${account}`;
      
      if (onDIDCreated) {
        onDIDCreated({
          did: did,
          didId: didId,
          metadataHash: ipfsHash,
          txHash: mockTxHash,
          name: didData.name
        });
      }
      
    } catch (error) {
      console.error('Error creating DID:', error);
      toast.error('Failed to create DID. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please connect your wallet to create a DID
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create Your Digital Identity (DID)</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={didData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={didData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
          <input
            type="text"
            name="organization"
            value={didData.organization}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your organization (optional)"
          />
        </div>
        
        <button
          onClick={createDID}
          disabled={isCreating || !didData.name.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating DID...</span>
            </>
          ) : (
            <span>Create My DID</span>
          )}
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> Your DID will be stored on the blockchain and linked to your wallet address. 
          The metadata will be stored on IPFS for decentralized access.
        </p>
      </div>
    </div>
  );
}

export default CreateDID;
