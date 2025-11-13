import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import CreateDID from '../components/CreateDID';
import { 
  ShieldCheckIcon,
  DocumentPlusIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [userDID, setUserDID] = useState(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    verifiedDocuments: 0,
    recentActivity: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data when account changes
    if (connectedAccount) {
      loadUserData();
    }
  }, [connectedAccount]);

  const loadUserData = async () => {
    try {
      // Mock data loading - replace with actual contract calls
      const mockStats = {
        totalDocuments: 5,
        verifiedDocuments: 4,
        recentActivity: [
          { id: 1, action: 'Document uploaded', document: 'Degree Certificate', time: '2 hours ago' },
          { id: 2, action: 'Document verified', document: 'ID Card', time: '1 day ago' },
          { id: 3, action: 'DID created', document: 'Digital Identity', time: '3 days ago' }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleWalletConnected = (account) => {
    setConnectedAccount(account);
  };

  const handleDIDCreated = (didData) => {
    setUserDID(didData);
    loadUserData(); // Refresh stats
  };

  const quickActions = [
    {
      title: 'Upload Document',
      description: 'Upload a new document to IPFS and blockchain',
      icon: DocumentPlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/upload'
    },
    {
      title: 'My Documents',
      description: 'View and manage your uploaded documents',
      icon: FolderIcon,
      color: 'bg-green-500 hover:bg-green-600',
      path: '/my-docs'
    },
    {
      title: 'Verify Document',
      description: 'Verify documents shared by others',
      icon: MagnifyingGlassIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/verify'
    }
  ];

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
              Please connect your MetaMask wallet to access the dashboard
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
              <h1 className="text-2xl font-bold text-gray-900">PixelGenesis</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Home
              </button>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your digital identity and documents securely on the blockchain
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedDocuments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* DID Section */}
            {!userDID ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Create Your Digital Identity
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create a decentralized identity (DID) to start using the platform
                </p>
                <CreateDID account={connectedAccount} onDIDCreated={handleDIDCreated} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <UserCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Your Digital Identity
                  </h3>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center text-green-800 mb-2">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">DID Created Successfully</span>
                  </div>
                  <p className="text-green-700 text-sm mb-2">
                    <strong>Name:</strong> {userDID.name}
                  </p>
                  <p className="text-green-700 text-sm">
                    <strong>DID ID:</strong> {userDID.didId}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} text-white p-4 rounded-lg transition-colors text-left`}
                  >
                    <action.icon className="h-8 w-8 mb-3" />
                    <h4 className="font-semibold mb-1">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wallet Address</p>
                  <p className="text-sm font-mono text-gray-800 break-all">
                    {connectedAccount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Network</p>
                  <p className="text-sm text-gray-800">Ethereum Sepolia Testnet</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">{activity.document}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Need Help?
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Learn how to use the platform effectively
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
