import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import { 
  ShieldCheckIcon, 
  DocumentIcon, 
  CloudArrowUpIcon, 
  QrCodeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function Home() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const navigate = useNavigate();

  const handleWalletConnected = (account) => {
    setConnectedAccount(account);
    if (account) {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Identity',
      description: 'Create a decentralized digital identity (DID) linked to your blockchain wallet'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'IPFS Storage',
      description: 'Upload documents to IPFS for decentralized, immutable storage'
    },
    {
      icon: DocumentIcon,
      title: 'Blockchain Verification',
      description: 'Store document hashes on blockchain for tamper-proof verification'
    },
    {
      icon: QrCodeIcon,
      title: 'Easy Sharing',
      description: 'Generate QR codes to share and verify documents instantly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">PixelGenesis</h1>
            </div>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Document
            <span className="text-blue-600 block">Verification</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create your decentralized identity, upload documents to IPFS, and verify credentials 
            on the blockchain. The future of document verification is here.
          </p>
          
          {!connectedAccount ? (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your MetaMask wallet to begin using the platform
              </p>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center mx-auto"
            >
              Go to Dashboard
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Connect Wallet
              </h4>
              <p className="text-gray-600">
                Connect your MetaMask wallet and create your decentralized identity (DID)
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Upload Documents
              </h4>
              <p className="text-gray-600">
                Upload your documents to IPFS and store verification hashes on the blockchain
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Share & Verify
              </h4>
              <p className="text-gray-600">
                Generate QR codes to share documents and allow others to verify their authenticity
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">
            Why Choose Blockchain Verification?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-800 mb-2">Immutable</h4>
              <p className="text-green-700 text-sm">
                Documents stored on blockchain cannot be altered or tampered with
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-2">Decentralized</h4>
              <p className="text-blue-700 text-sm">
                No single point of failure - your documents are always accessible
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-800 mb-2">Transparent</h4>
              <p className="text-purple-700 text-sm">
                All verification records are publicly auditable on the blockchain
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Global</h4>
              <p className="text-yellow-700 text-sm">
                Verify documents anywhere in the world without intermediaries
              </p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="font-semibold text-red-800 mb-2">Instant</h4>
              <p className="text-red-700 text-sm">
                Real-time verification without waiting for third-party approval
              </p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6">
              <h4 className="font-semibold text-indigo-800 mb-2">Cost-Effective</h4>
              <p className="text-indigo-700 text-sm">
                Eliminate expensive verification processes and intermediary fees
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">PixelGenesis</span>
          </div>
          <p className="text-gray-400">
            Secure, decentralized document verification powered by blockchain technology
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
