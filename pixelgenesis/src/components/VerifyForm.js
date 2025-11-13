import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  DocumentIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

function VerifyForm({ ipfsHash: initialIpfsHash = '', txHash: initialTxHash = '' }) {
  const [verificationData, setVerificationData] = useState({
    ipfsHash: initialIpfsHash,
    txHash: initialTxHash
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Update state when props change (e.g., from URL parameters)
  useEffect(() => {
    if (initialIpfsHash || initialTxHash) {
      setVerificationData({
        ipfsHash: initialIpfsHash,
        txHash: initialTxHash
      });
    }
  }, [initialIpfsHash, initialTxHash]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const verifyFromIPFS = async (ipfsHash) => {
    try {
      // Mock IPFS retrieval - replace with actual IPFS service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate IPFS data retrieval
      const mockMetadata = {
        title: "Bachelor's Degree in Computer Science",
        description: "Degree certificate from University of Technology",
        category: "diploma",
        fileName: "degree_certificate.pdf",
        fileSize: 2048576,
        fileType: "application/pdf",
        owner: "0x1234567890123456789012345678901234567890",
        createdAt: "2024-01-15T10:30:00.000Z",
        version: "1.0"
      };
      
      return mockMetadata;
    } catch (error) {
      throw new Error('Failed to retrieve document from IPFS');
    }
  };

  const verifyOnBlockchain = async (txHash) => {
    try {
      // Mock blockchain verification - replace with actual contract interaction
      // Check if MetaMask is available (optional for verification)
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // In a real implementation, you would use the provider to fetch transaction data
        // const tx = await provider.getTransaction(txHash);
        // const receipt = await provider.getTransactionReceipt(txHash);
      }
      
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction data
      const mockTxData = {
        hash: txHash,
        blockNumber: 18234567,
        timestamp: 1705312200,
        from: "0x1234567890123456789012345678901234567890",
        to: "0x9876543210987654321098765432109876543210",
        status: 1, // Success
        gasUsed: "45000"
      };
      
      return mockTxData;
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw new Error('Failed to verify transaction on blockchain: ' + error.message);
    }
  };

  const verifyDocument = async () => {
    if (!verificationData.ipfsHash && !verificationData.txHash) {
      toast.error('Please provide either IPFS hash or transaction hash');
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationResult(null);
      
      let metadata = null;
      let blockchainData = null;
      
      // Verify IPFS hash if provided
      if (verificationData.ipfsHash) {
        toast.loading('Retrieving document from IPFS...', { id: 'verify' });
        metadata = await verifyFromIPFS(verificationData.ipfsHash);
      }
      
      // Verify blockchain transaction if provided
      if (verificationData.txHash) {
        toast.loading('Verifying on blockchain...', { id: 'verify' });
        blockchainData = await verifyOnBlockchain(verificationData.txHash);
      }
      
      // Determine verification status
      const isValid = metadata || blockchainData;
      const verificationStatus = {
        isValid,
        metadata,
        blockchainData,
        verifiedAt: new Date().toISOString(),
        ipfsVerified: !!metadata,
        blockchainVerified: !!blockchainData
      };
      
      setVerificationResult(verificationStatus);
      
      if (isValid) {
        toast.success('Document verified successfully!', { id: 'verify' });
      } else {
        toast.error('Document verification failed', { id: 'verify' });
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Verification failed', { id: 'verify' });
      setVerificationResult({
        isValid: false,
        error: error.message,
        verifiedAt: new Date().toISOString()
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const clearForm = () => {
    setVerificationData({ ipfsHash: '', txHash: '' });
    setVerificationResult(null);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Verify Document</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IPFS Hash
          </label>
          <input
            type="text"
            name="ipfsHash"
            value={verificationData.ipfsHash}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Qm... (IPFS hash of the document)"
          />
        </div>
        
        <div className="text-center text-gray-500 text-sm">OR</div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Hash
          </label>
          <input
            type="text"
            name="txHash"
            value={verificationData.txHash}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="0x... (Blockchain transaction hash)"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={verifyDocument}
            disabled={isVerifying || (!verificationData.ipfsHash && !verificationData.txHash)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Verify Document</span>
              </>
            )}
          </button>
          
          <button
            onClick={clearForm}
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            {verificationResult.isValid ? (
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            ) : (
              <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {verificationResult.isValid ? 'Document Verified' : 'Verification Failed'}
              </h3>
              <p className="text-sm text-gray-600">
                Verified on {new Date(verificationResult.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {verificationResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{verificationResult.error}</p>
            </div>
          )}

          {/* Document Metadata */}
          {verificationResult.metadata && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-800 mb-3">Document Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <DocumentIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium">Title:</span>
                  <span className="ml-2">{verificationResult.metadata.title}</span>
                </div>
                
                {verificationResult.metadata.description && (
                  <div className="flex items-start">
                    <span className="font-medium">Description:</span>
                    <span className="ml-2">{verificationResult.metadata.description}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {new Date(verificationResult.metadata.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium">Owner:</span>
                  <span className="ml-2 font-mono">
                    {formatAddress(verificationResult.metadata.owner)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 capitalize">{verificationResult.metadata.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Information */}
          {verificationResult.blockchainData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Blockchain Verification</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Transaction Hash:</span>
                  <div className="font-mono text-xs break-all mt-1">
                    {verificationResult.blockchainData.hash}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Block Number:</span>
                  <span className="ml-2">{verificationResult.blockchainData.blockNumber}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Timestamp:</span>
                  <span className="ml-2">
                    {formatDate(verificationResult.blockchainData.timestamp)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 text-green-600 font-medium">Confirmed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyForm;
