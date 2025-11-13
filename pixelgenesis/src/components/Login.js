import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletConnect from './WalletConnect';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleWalletConnected = (account) => {
    setWalletAddress(account);
  };

  const handleLogin = () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (selectedRole === 'user' && !walletAddress) {
      toast.error('Please connect your wallet to continue as a user');
      return;
    }

    // For verifier, wallet is optional but can be connected
    login(selectedRole, walletAddress);
    toast.success(`Logged in as ${selectedRole === 'user' ? 'User' : 'Verifier'}`);
    
    // Navigate to appropriate dashboard
    if (selectedRole === 'user') {
      navigate('/user-dashboard');
    } else {
      navigate('/verifier-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to PixelGenesis
          </h1>
          <p className="text-gray-600">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleRoleSelect('user')}
            className={`w-full p-6 rounded-lg border-2 transition-all ${
              selectedRole === 'user'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <UserIcon className={`h-6 w-6 ${
                    selectedRole === 'user' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">User</h3>
                  <p className="text-sm text-gray-600">
                    Upload and manage your documents
                  </p>
                </div>
              </div>
              {selectedRole === 'user' && (
                <ArrowRightIcon className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('verifier')}
            className={`w-full p-6 rounded-lg border-2 transition-all ${
              selectedRole === 'verifier'
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'verifier' ? 'bg-purple-500' : 'bg-gray-200'
                }`}>
                  <ShieldCheckIcon className={`h-6 w-6 ${
                    selectedRole === 'verifier' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Verifier</h3>
                  <p className="text-sm text-gray-600">
                    Verify documents on the blockchain
                  </p>
                </div>
              </div>
              {selectedRole === 'verifier' && (
                <ArrowRightIcon className="h-5 w-5 text-purple-500" />
              )}
            </div>
          </button>
        </div>

        {/* Wallet Connection (Required for User) */}
        {selectedRole === 'user' && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Wallet connection is required for users to upload and manage documents.
              </p>
            </div>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </div>
        )}

        {/* Wallet Connection (Optional for Verifier) */}
        {selectedRole === 'verifier' && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Wallet connection is optional for verifiers. You can verify documents without connecting a wallet.
              </p>
            </div>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedRole || (selectedRole === 'user' && !walletAddress)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            !selectedRole || (selectedRole === 'user' && !walletAddress)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : selectedRole === 'user'
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          <span>Continue as {selectedRole === 'user' ? 'User' : selectedRole === 'verifier' ? 'Verifier' : '...'}</span>
          <ArrowRightIcon className="h-5 w-5" />
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Select a role and connect your wallet (if required) to get started</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

