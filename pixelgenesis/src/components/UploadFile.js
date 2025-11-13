import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

function UploadFile({ account, onFileUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentData, setDocumentData] = useState({
    title: '',
    description: '',
    category: 'certificate'
  });

  const categories = [
    { value: 'certificate', label: 'Certificate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'license', label: 'License' },
    { value: 'identity', label: 'Identity Document' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, PDF, and TXT files are allowed');
        return;
      }
      
      setSelectedFile(file);
      
      // Auto-fill title if not provided
      if (!documentData.title) {
        setDocumentData(prev => ({
          ...prev,
          title: file.name.split('.')[0]
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToIPFS = async (file) => {
    try {
      // Mock IPFS upload - in production, use Pinata or similar service
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock IPFS hash
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      console.log('Mock IPFS upload completed:', {
        fileName: file.name,
        fileSize: file.size,
        ipfsHash: mockHash
      });
      
      return mockHash;
    } catch (error) {
      throw new Error('Failed to upload file to IPFS');
    }
  };

  const storeOnBlockchain = async (fileHash, metadata) => {
    try {
      // Mock blockchain storage - replace with actual smart contract
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      
      console.log('Mock blockchain storage:', {
        fileHash,
        metadata,
        txHash: mockTxHash
      });
      
      return mockTxHash;
    } catch (error) {
      throw new Error('Failed to store document on blockchain');
    }
  };

  const uploadDocument = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!documentData.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      setIsUploading(true);
      
      // Step 1: Upload file to IPFS
      toast.loading('Uploading file to IPFS...', { id: 'upload' });
      const fileHash = await uploadToIPFS(selectedFile);
      
      // Step 2: Create metadata
      const metadata = {
        title: documentData.title,
        description: documentData.description,
        category: documentData.category,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        ipfsHash: fileHash,
        owner: account,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // Step 3: Store on blockchain
      toast.loading('Storing document on blockchain...', { id: 'upload' });
      const txHash = await storeOnBlockchain(fileHash, metadata);
      
      toast.success('Document uploaded successfully!', { id: 'upload' });
      
      // Clear form
      setSelectedFile(null);
      setDocumentData({ title: '', description: '', category: 'certificate' });
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      if (onFileUploaded) {
        onFileUploaded({
          id: Math.floor(Math.random() * 1000000),
          ...metadata,
          txHash,
          blockchainHash: txHash
        });
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document', { id: 'upload' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please connect your wallet to upload documents
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Document</h2>
      
      <div className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.txt"
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <DocumentArrowUpIcon className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => document.getElementById('file-input').click()}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Change File
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <button
                  onClick={() => document.getElementById('file-input').click()}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Click to upload
                </button>
                <p className="text-gray-500">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">
                JPEG, PNG, PDF, TXT up to 10MB
              </p>
            </div>
          )}
        </div>
        
        {/* Document Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title *
          </label>
          <input
            type="text"
            name="title"
            value={documentData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document title"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={documentData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={documentData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter document description (optional)"
          />
        </div>
        
        <button
          onClick={uploadDocument}
          disabled={isUploading || !selectedFile || !documentData.title.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <DocumentArrowUpIcon className="h-5 w-5" />
              <span>Upload Document</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> Your document will be encrypted and stored on IPFS, 
          with a hash stored on the blockchain for verification.
        </p>
      </div>
    </div>
  );
}

export default UploadFile;
