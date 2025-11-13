import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import UploadFile from '../components/UploadFile';
import CredentialCard from '../components/CredentialCard';
import BlockchainUsers from '../components/BlockchainUsers';
import { 
  ShieldCheckIcon,
  DocumentPlusIcon,
  FolderIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function UserDashboard() {
  const { userRole, walletAddress, logout, updateWallet, loading, userData } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    verifiedDocuments: 0,
    recentActivity: []
  });
  const navigate = useNavigate();

  const loadUserData = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      // Load from localStorage or API
      const savedDocs = localStorage.getItem(`documents_${walletAddress}`);
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        setDocuments(parsedDocs);
        setStats({
          totalDocuments: parsedDocs.length,
          verifiedDocuments: parsedDocs.filter(d => d.verified).length,
          recentActivity: parsedDocs.slice(0, 5).map(doc => ({
            id: doc.id,
            action: 'Document uploaded',
            document: doc.title,
            time: new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()
          }))
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [walletAddress]);

  useEffect(() => {
    // Redirect if not logged in as user
    if (!loading && (!userRole || userRole !== 'user')) {
      navigate('/user-login');
      return;
    }

    // Load user data when wallet is connected
    if (walletAddress) {
      loadUserData();
    }
  }, [userRole, walletAddress, navigate, loadUserData, loading]);

  const handleWalletConnected = (account) => {
    updateWallet(account);
    if (account) {
      toast.success('Wallet connected successfully');
    }
  };

  const handleFileUploaded = (fileData) => {
    // Ensure unique CID is present
    const documentWithCID = {
      ...fileData,
      cid: fileData.ipfsHash || fileData.cid || `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      id: fileData.id || Date.now(),
      verified: true,
      uploadedAt: new Date().toISOString(),
      createdAt: fileData.createdAt || new Date().toISOString()
    };

    const updatedDocuments = [documentWithCID, ...documents];
    setDocuments(updatedDocuments);
    
    // Save to localStorage
    if (walletAddress) {
      localStorage.setItem(`documents_${walletAddress}`, JSON.stringify(updatedDocuments));
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalDocuments: updatedDocuments.length,
      verifiedDocuments: updatedDocuments.filter(d => d.verified).length,
      recentActivity: updatedDocuments.slice(0, 5).map(doc => ({
        id: doc.id,
        action: 'Document uploaded',
        document: doc.title,
        time: new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()
      }))
    }));

    toast.success('Document uploaded successfully with unique CID!');
  };

  const handleViewDocument = (document) => {
    console.log('Viewing document:', document);
    toast.success(`Viewing: ${document.title}`);
  };

  const handleShareDocument = (document) => {
    console.log('Sharing document:', document);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your MetaMask wallet to access the user dashboard
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
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnect onWalletConnected={handleWalletConnected} />
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
              <FolderIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified Documents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.verifiedDocuments}</p>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
                <p className="text-sm font-mono text-gray-700 break-all">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </p>
              </div>
              <UserCircleIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg shadow-md transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <DocumentPlusIcon className="h-8 w-8" />
              <div className="text-left">
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <p className="text-sm opacity-90">Upload a new document to IPFS</p>
              </div>
            </div>
            <ArrowRightIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => navigate('/my-docs')}
            className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg shadow-md transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FolderIcon className="h-8 w-8" />
              <div className="text-left">
                <h3 className="text-lg font-semibold">Manage Documents</h3>
                <p className="text-sm opacity-90">View and manage your documents</p>
              </div>
            </div>
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload New Document</h2>
          <UploadFile account={walletAddress} onFileUploaded={handleFileUploaded} />
        </div>

        {/* Recent Documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Recent Documents</h2>
              <button
                onClick={() => navigate('/my-docs')}
                className="text-blue-500 hover:text-blue-600 font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.slice(0, 6).map((document) => (
                <CredentialCard
                  key={document.id}
                  credential={document}
                  onView={handleViewDocument}
                  onShare={handleShareDocument}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <DocumentPlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first document to get started
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <DocumentPlusIcon className="h-5 w-5" />
              <span>Upload Document</span>
            </button>
          </div>
        )}

        {/* Blockchain Users Section */}
        <div className="mt-8">
          <BlockchainUsers currentUserWallet={walletAddress} />
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;

