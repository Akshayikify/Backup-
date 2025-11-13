import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { backendApi } from '../utils/api';
import { ipfsUtils } from '../utils/ipfs';
import { contractFunctions, getProvider } from '../utils/contract';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  DocumentIcon,
  CalendarIcon,
  UserIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

function VerifyForm({ ipfsHash: initialIpfsHash = '', txHash: initialTxHash = '', onVerificationComplete }) {
  const [verificationData, setVerificationData] = useState({
    ipfsHash: initialIpfsHash,
    txHash: initialTxHash
  });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const hasAutoVerified = useRef(false);

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
      toast.loading('Retrieving document from IPFS...', { id: 'ipfs' });
      
      // Validate IPFS hash format
      if (!ipfsUtils.isValidIPFSHash(ipfsHash)) {
        throw new Error('Invalid IPFS hash format. IPFS hash should start with "Qm" followed by 44 characters, or "b" followed by 58 characters for CIDv1.');
      }
      
      // Check if this is a mock hash (development/testing)
      // Mock hashes are shorter and won't work on real IPFS gateways
      if (ipfsHash.length < 46) {
        throw new Error('This appears to be a mock/test IPFS hash. Real IPFS hashes are 46 characters long (CIDv0) or 59 characters (CIDv1). Please use a real IPFS hash from an actual upload.');
      }

      // Try to get file info from Pinata first (if configured)
      try {
        const fileInfo = await ipfsUtils.getFileInfo(ipfsHash);
        
        if (fileInfo.success) {
          // File exists on Pinata
          const metadata = fileInfo.metadata || {};
          return {
            title: metadata.name || 'Document',
            description: metadata.description || '',
            category: metadata.category || 'document',
            fileName: metadata.fileName || ipfsHash,
            fileSize: fileInfo.size || 0,
            fileType: metadata.fileType || 'application/octet-stream',
            owner: metadata.uploadedBy || metadata.owner || 'Unknown',
            createdAt: fileInfo.timestamp || new Date().toISOString(),
            version: metadata.version || '1.0',
            ipfsHash: ipfsHash,
            ipfsUrl: ipfsUtils.getIPFSUrl(ipfsHash)
          };
        }
      } catch (pinataError) {
        console.log('Pinata file info not available, trying other methods...');
      }

      // Try to fetch metadata JSON from IPFS
      try {
        const jsonResult = await ipfsUtils.getJSON(ipfsHash);
        if (jsonResult.success && jsonResult.data) {
          return {
            ...jsonResult.data,
            ipfsHash: ipfsHash,
            ipfsUrl: jsonResult.url
          };
        }
      } catch (jsonError) {
        console.log('No JSON metadata found, trying to fetch file directly');
      }

      // Try to fetch file directly to verify it exists
      try {
        const fileResult = await ipfsUtils.getFile(ipfsHash);
        if (fileResult.success) {
          return {
            title: 'Document',
            description: 'Document retrieved from IPFS',
            category: 'document',
            fileName: ipfsHash,
            fileSize: fileResult.data.size || 0,
            fileType: fileResult.contentType || 'application/octet-stream',
            owner: 'Unknown',
            createdAt: new Date().toISOString(),
            version: '1.0',
            ipfsHash: ipfsHash,
            ipfsUrl: fileResult.url
          };
        }
      } catch (fileError) {
        console.error('Error fetching file from IPFS gateways:', fileError);
        // If all gateways fail, provide helpful error message
        if (fileError.message && fileError.message.includes('Failed to retrieve')) {
          throw new Error(`Content not found on IPFS. The hash "${ipfsHash}" may not be pinned or the content may not be available on IPFS gateways. This could be a mock/test hash.`);
        }
        throw fileError;
      }

      // If all methods fail, check backend API
      try {
        const backendUrl = backendApi.getBaseUrl();
        const response = await fetch(`${backendUrl}/api/ipfs/${ipfsHash}`);
        if (response.ok) {
          const data = await response.json();
          return {
            title: data.title || 'Document',
            description: data.description || '',
            category: data.category || 'document',
            fileName: data.fileName || ipfsHash,
            fileSize: data.fileSize || 0,
            fileType: data.fileType || 'application/octet-stream',
            owner: data.owner || 'Unknown',
            createdAt: data.createdAt || new Date().toISOString(),
            version: data.version || '1.0',
            ipfsHash: ipfsHash,
            ipfsUrl: data.ipfsUrl || ipfsUtils.getIPFSUrl(ipfsHash)
          };
        }
      } catch (apiError) {
        console.error('Backend API error:', apiError);
      }

      // If all methods fail, provide detailed error
      const errorMessage = `Document not found on IPFS. 
      
Possible reasons:
• The IPFS hash may be invalid or not pinned
• The content may not be available on IPFS gateways yet
• This might be a mock/test hash (not a real IPFS upload)
• The IPFS network may be experiencing issues

Try:
• Verify the IPFS hash is correct (46 chars for CIDv0, 59 for CIDv1)
• Check if the document was actually uploaded to IPFS
• Wait a few minutes and try again (IPFS propagation can take time)
• Use a different IPFS gateway`;

      throw new Error(errorMessage);
    } catch (error) {
      console.error('IPFS verification error:', error);
      // Preserve the detailed error message if it's already formatted
      if (error.message && error.message.includes('Possible reasons:')) {
        throw error;
      }
      throw new Error(`Failed to retrieve document from IPFS: ${error.message}`);
    }
  };

  const verifyOnBlockchain = async (txHash) => {
    try {
      toast.loading('Verifying transaction on blockchain...', { id: 'blockchain' });
      
      // Validate transaction hash format
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        throw new Error('Invalid transaction hash format');
      }

      let provider;
      
      // Try to use MetaMask provider if available
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        // Fallback to public RPC endpoint (Sepolia testnet)
        provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_KEY');
      }

      // Get transaction details
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found on blockchain');
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Get block details for timestamp
      const block = await provider.getBlock(receipt.blockNumber);
      
      // Verify transaction status
      const status = receipt.status === 1 ? 'Success' : 'Failed';
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on blockchain');
      }

      // Try to get document details from contract if available
      let documentData = null;
      try {
        // Check if transaction is to our contract
        // You can add contract address check here
        // const contractAddress = 'YOUR_CONTRACT_ADDRESS';
        // if (receipt.to && receipt.to.toLowerCase() === contractAddress.toLowerCase()) {
        //   // Parse logs to get document ID
        //   // Then fetch document from contract
        // }
      } catch (contractError) {
        console.log('Could not fetch contract data:', contractError);
      }

      return {
        hash: txHash,
        blockNumber: receipt.blockNumber,
        timestamp: block.timestamp,
        from: tx.from,
        to: receipt.to || tx.to,
        status: receipt.status,
        statusText: status,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: receipt.confirmations,
        documentData: documentData
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      
      // Try alternative verification via backend API
      try {
        const backendUrl = backendApi.getBaseUrl();
        const response = await fetch(`${backendUrl}/api/verify/tx/${txHash}`);
        if (response.ok) {
          const data = await response.json();
          return {
            hash: txHash,
            blockNumber: data.blockNumber || 0,
            timestamp: data.timestamp || Math.floor(Date.now() / 1000),
            from: data.from || 'Unknown',
            to: data.to || 'Unknown',
            status: data.status || 1,
            statusText: data.status === 1 ? 'Success' : 'Failed',
            gasUsed: data.gasUsed || '0',
            confirmations: data.confirmations || 0,
            documentData: data.documentData || null
          };
        }
      } catch (apiError) {
        console.error('Backend API verification error:', apiError);
      }
      
      throw new Error(`Failed to verify transaction on blockchain: ${error.message}`);
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
        try {
          metadata = await verifyFromIPFS(verificationData.ipfsHash);
          toast.success('Document retrieved from IPFS', { id: 'ipfs' });
        } catch (ipfsError) {
          console.error('IPFS verification failed:', ipfsError);
          toast.error(`IPFS verification failed: ${ipfsError.message}`, { id: 'ipfs' });
        }
      }
      
      // Verify blockchain transaction if provided
      if (verificationData.txHash) {
        toast.loading('Verifying on blockchain...', { id: 'verify' });
        try {
          blockchainData = await verifyOnBlockchain(verificationData.txHash);
          toast.success('Transaction verified on blockchain', { id: 'blockchain' });
        } catch (blockchainError) {
          console.error('Blockchain verification failed:', blockchainError);
          toast.error(`Blockchain verification failed: ${blockchainError.message}`, { id: 'blockchain' });
        }
      }
      
      // Cross-verify: If both IPFS and transaction hash are provided, verify they match
      if (metadata && blockchainData && blockchainData.documentData) {
        const blockchainIpfsHash = blockchainData.documentData.ipfsHash;
        if (blockchainIpfsHash && blockchainIpfsHash !== verificationData.ipfsHash) {
          throw new Error('IPFS hash mismatch: Document hash on blockchain does not match provided IPFS hash');
        }
      }
      
      // Determine verification status
      const isValid = (metadata && metadata.ipfsHash) || (blockchainData && blockchainData.status === 1);
      const verificationStatus = {
        isValid,
        metadata,
        blockchainData,
        verifiedAt: new Date().toISOString(),
        ipfsVerified: !!metadata,
        blockchainVerified: !!blockchainData
      };
      
      setVerificationResult(verificationStatus);
      
      // Call callback if provided
      if (onVerificationComplete) {
        onVerificationComplete({
          ...verificationStatus,
          ipfsHash: verificationData.ipfsHash,
          txHash: verificationData.txHash
        });
      }
      
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

  // Auto-verify when hash is provided from QR code/URL (after verifyDocument is defined)
  useEffect(() => {
    if (initialIpfsHash && !hasAutoVerified.current && verificationData.ipfsHash === initialIpfsHash) {
      hasAutoVerified.current = true;
      // Auto-verify after a short delay to ensure form is ready
      const timer = setTimeout(() => {
        verifyDocument();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationData.ipfsHash, initialIpfsHash]);

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
              <p className="text-red-800 text-sm whitespace-pre-line">{verificationResult.error}</p>
              <div className="mt-3 text-xs text-red-700">
                <p className="font-medium mb-1">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure the IPFS hash is from a real upload (not a mock/test hash)</li>
                  <li>Check that the document was successfully uploaded to IPFS</li>
                  <li>Verify the hash format is correct</li>
                  <li>Try accessing the document directly via IPFS gateways</li>
                </ul>
              </div>
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
                  <span className={`ml-2 font-medium ${
                    verificationResult.blockchainData.status === 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationResult.blockchainData.statusText || 'Unknown'}
                  </span>
                </div>
                
                {verificationResult.blockchainData.confirmations > 0 && (
                  <div className="flex items-center">
                    <span className="font-medium">Confirmations:</span>
                    <span className="ml-2">{verificationResult.blockchainData.confirmations}</span>
                  </div>
                )}
                
                {verificationResult.metadata?.ipfsUrl && (
                  <div className="flex items-center mt-2">
                    <LinkIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <a 
                      href={verificationResult.metadata.ipfsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all"
                    >
                      View on IPFS
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyForm;
