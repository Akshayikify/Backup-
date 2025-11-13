import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import VerifyForm from '../components/VerifyForm';
import { 
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

function Verify() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if URL has hash or tx parameters (from shared links)
    const ipfsHash = searchParams.get('hash');
    const txHash = searchParams.get('tx');
    
    if (ipfsHash || txHash) {
      // Pre-fill the verification form with URL parameters
      console.log('Verification parameters from URL:', { ipfsHash, txHash });
    }
  }, [searchParams]);

  const handleWalletConnected = (account) => {
    setConnectedAccount(account);
  };

  const goBack = () => {
    navigate('/dashboard');
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Verify Document</h1>
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
            Verify Document
          </h2>
          <p className="text-gray-600">
            Verify the authenticity of documents stored on IPFS and blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Form */}
          <div className="lg:col-span-2">
            <VerifyForm 
              ipfsHash={searchParams.get('hash') || ''}
              txHash={searchParams.get('tx') || ''}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Verify */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                How to Verify
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Get Document Hash</p>
                    <p className="text-sm text-gray-600">
                      Obtain the IPFS hash or transaction hash from the document owner
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Enter Hash</p>
                    <p className="text-sm text-gray-600">
                      Paste the IPFS hash or transaction hash in the verification form
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Verify</p>
                    <p className="text-sm text-gray-600">
                      Click verify to check document authenticity on the blockchain
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-semibold text-blue-800">
                  What Gets Verified?
                </h3>
              </div>
              <div className="text-blue-700 text-sm space-y-2">
                <p>
                  The verification process checks:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Document exists on IPFS</li>
                  <li>Document hash matches blockchain record</li>
                  <li>Document ownership is verified</li>
                  <li>Document has not been tampered with</li>
                  <li>Transaction is confirmed on blockchain</li>
                </ul>
              </div>
            </div>

            {/* Verification Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Verification Benefits
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong>Tamper-proof:</strong> Verify document integrity
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong>Transparent:</strong> All records are public
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong>Decentralized:</strong> No single point of failure
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    <strong>Instant:</strong> Real-time verification
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                QR Code Verification
              </h3>
              <p className="text-green-700 text-sm mb-3">
                Documents can be shared via QR codes. Scan the QR code to automatically 
                fill in the verification form.
              </p>
              <p className="text-green-700 text-sm">
                The QR code contains the IPFS hash and transaction hash for instant verification.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Understanding Verification
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">IPFS Hash</h4>
              <p>
                The IPFS hash (Content Identifier) is a unique identifier for your document 
                stored on the InterPlanetary File System. It's used to retrieve the document 
                from the decentralized network.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Transaction Hash</h4>
              <p>
                The transaction hash is a unique identifier for the blockchain transaction 
                that stored the document hash. It provides proof that the document was 
                registered on the blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Blockchain Verification</h4>
              <p>
                When you verify a document, the system checks the blockchain to confirm 
                that the hash exists and matches the IPFS-stored document, ensuring 
                authenticity and integrity.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Document Integrity</h4>
              <p>
                The verification process ensures that the document has not been modified 
                since it was originally uploaded and stored on the blockchain. Any changes 
                would result in a different hash.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Verify;

