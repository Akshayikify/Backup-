import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import UploadFile from '../components/UploadFile';
import { 
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function Upload() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  const handleWalletConnected = (account) => {
    setConnectedAccount(account);
  };

  const handleFileUploaded = (fileData) => {
    setUploadedFiles(prev => [fileData, ...prev]);
    
    // Save to localStorage for the user dashboard
    if (connectedAccount) {
      const savedDocs = localStorage.getItem(`documents_${connectedAccount}`);
      const existingDocs = savedDocs ? JSON.parse(savedDocs) : [];
      const updatedDocs = [fileData, ...existingDocs];
      localStorage.setItem(`documents_${connectedAccount}`, JSON.stringify(updatedDocs));
    }
  };

  const goBack = () => {
    navigate('/dashboard');
  };

  if (!connectedAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your MetaMask wallet to upload documents
            </p>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={goBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </button>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Upload New Document
          </h2>
          <p className="text-gray-600">
            Securely upload your documents to IPFS and store verification hashes on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <UploadFile 
              account={connectedAccount} 
              onFileUploaded={handleFileUploaded}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upload Guidelines */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Upload Guidelines
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Maximum file size: 10MB</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Supported formats: JPEG, PNG, PDF, TXT</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Files are encrypted before IPFS upload</span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Blockchain hash provides tamper-proof verification</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Security Notice
              </h3>
              <div className="text-blue-700 text-sm space-y-2">
                <p>
                  Your documents are stored securely using:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>IPFS for decentralized storage</li>
                  <li>Blockchain for immutable verification</li>
                  <li>Encryption for privacy protection</li>
                </ul>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Upload Process
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">File Upload</p>
                    <p className="text-sm text-gray-600">File is uploaded to IPFS network</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Hash Generation</p>
                    <p className="text-sm text-gray-600">Unique IPFS hash is generated</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Blockchain Storage</p>
                    <p className="text-sm text-gray-600">Hash is stored on blockchain</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Verification Ready</p>
                    <p className="text-sm text-gray-600">Document can now be verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        {uploadedFiles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Recently Uploaded
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedFiles.slice(0, 6).map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-600">Uploaded Successfully</span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2 truncate">
                    {file.title}
                  </h4>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">File:</span> {file.fileName}</p>
                    <p><span className="font-medium">Category:</span> {file.category}</p>
                    <p><span className="font-medium">Size:</span> {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Unique CID:</p>
                    <p className="text-xs text-gray-700 font-mono break-all">
                      {file.cid || file.ipfsHash}
                    </p>
                    {file.ipfsHash && file.ipfsHash !== file.cid && (
                      <>
                        <p className="text-xs text-gray-500 mb-1 mt-2">IPFS Hash:</p>
                        <p className="text-xs text-gray-700 font-mono break-all">
                          {file.ipfsHash}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => navigate('/my-docs')}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {uploadedFiles.length > 6 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/my-docs')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  View All Documents
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Upload;
