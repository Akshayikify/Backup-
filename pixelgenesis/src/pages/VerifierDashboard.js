import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import VerifyForm from '../components/VerifyForm';
import { 
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function VerifierDashboard() {
  const { userRole, logout, loading } = useAuth();
  const [verificationHistory, setVerificationHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in as verifier
    if (!loading && (!userRole || userRole !== 'verifier')) {
      navigate('/verifier-login');
      return;
    }

    // Load verification history from localStorage
    const savedHistory = localStorage.getItem('verificationHistory');
    if (savedHistory) {
      setVerificationHistory(JSON.parse(savedHistory));
    }
  }, [userRole, navigate, loading]);

  const handleVerification = (verificationResult) => {
    const newVerification = {
      id: Date.now(),
      ...verificationResult,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newVerification, ...verificationHistory];
    setVerificationHistory(updatedHistory);
    localStorage.setItem('verificationHistory', JSON.stringify(updatedHistory));

    if (verificationResult.isValid) {
      toast.success('Document verified successfully!');
    } else {
      toast.error('Document verification failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/verifier-login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <ShieldCheckIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Verifier Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect onWalletConnected={() => {}} />
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <DocumentCheckIcon className="h-12 w-12" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Document Verification</h2>
              <p className="text-purple-100">
                Verify the authenticity of documents stored on IPFS and blockchain
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-purple-600" />
                Verify Document
              </h3>
              <VerifyForm onVerificationComplete={handleVerification} />
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Verifications</p>
                    <p className="text-2xl font-bold text-gray-900">{verificationHistory.length}</p>
                  </div>
                  <DocumentCheckIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                      {verificationHistory.filter(v => v.isValid).length}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {verificationHistory.filter(v => !v.isValid).length}
                    </p>
                  </div>
                  <XCircleIcon className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>
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
                  <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Get Document Hash</p>
                    <p className="text-sm text-gray-600">
                      Obtain the IPFS hash or transaction hash from the document owner
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Enter Hash</p>
                    <p className="text-sm text-gray-600">
                      Paste the IPFS hash or transaction hash in the verification form
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-purple-600">3</span>
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start mb-3">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-semibold text-purple-800">
                  What Gets Verified?
                </h3>
              </div>
              <div className="text-purple-700 text-sm space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Document exists on IPFS</li>
                  <li>Document hash matches blockchain record</li>
                  <li>Document ownership is verified</li>
                  <li>Document has not been tampered with</li>
                  <li>Transaction is confirmed on blockchain</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Verification History</h3>
            <div className="space-y-4">
              {verificationHistory.slice(0, 10).map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {verification.isValid ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {verification.ipfsHash || verification.txHash || 'Unknown Document'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(verification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verification.isValid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.isValid ? 'Verified' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default VerifierDashboard;

