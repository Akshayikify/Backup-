import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import WalletConnect from './WalletConnect';
import CreateDID from './CreateDID';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function UserRegister() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [didCreated, setDidCreated] = useState(false);
  const [didData, setDidData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setFirebaseUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWalletConnected = (account) => {
    setWalletAddress(account);
  };

  const handleDIDCreated = (did) => {
    setDidData(did);
    setDidCreated(true);
    toast.success('DID created successfully!');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!didCreated || !didData) {
      toast.error('Please create your DID first');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Creating account...', { id: 'register' });

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const firebaseUser = userCredential.user;

      // Create user document in Realtime Database
      await set(ref(db, `users/${firebaseUser.uid}`), {
        username: formData.username,
        email: formData.email,
        walletAddress: walletAddress.toLowerCase(),
        role: 'user',
        did: didData.did || `did:ethr:${walletAddress}`,
        didId: didData.didId,
        metadataHash: didData.metadataHash,
        txHash: didData.txHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Set Firebase user
      setFirebaseUser(firebaseUser);

      toast.success('Account created successfully!', { id: 'register' });
      
      // Navigate to user dashboard
      navigate('/user-dashboard');

    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account';
      
      // Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      // Realtime Database errors
      else if (error.code === 'PERMISSION_DENIED' || error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Realtime Database security rules';
      } else if (error.code === 'UNAVAILABLE' || error.code === 'unavailable') {
        errorMessage = 'Database is unavailable. Please try again';
      } else if (error.code === 'UNAUTHENTICATED' || error.code === 'unauthenticated') {
        errorMessage = 'Authentication failed. Please try again';
      }
      // Generic error with more details
      else if (error.message) {
        errorMessage = `Failed to create account: ${error.message}`;
      }
      
      toast.error(errorMessage, { id: 'register' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <UserIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Registration
          </h1>
          <p className="text-gray-600">
            Create your account and digital identity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Note:</strong> Wallet connection is required
                </p>
                <WalletConnect onWalletConnected={handleWalletConnected} />
                {walletAddress && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Wallet connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !walletAddress || !didCreated}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isLoading || !walletAddress || !didCreated
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/user-login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* DID Creation */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create Digital Identity (DID)
            </h2>
            
            {!walletAddress ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">
                  Please connect your wallet first to create a DID
                </p>
              </div>
            ) : (
              <>
                {didCreated ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">DID Created Successfully</span>
                    </div>
                    {didData && (
                      <div className="mt-3 text-sm text-green-700 space-y-1">
                        <p><strong>DID:</strong> {didData.did || `did:ethr:${walletAddress}`}</p>
                        {didData.didId && <p><strong>DID ID:</strong> {didData.didId}</p>}
                        {didData.metadataHash && (
                          <p className="text-xs break-all"><strong>Metadata Hash:</strong> {didData.metadataHash}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <CreateDID 
                    account={walletAddress} 
                    onDIDCreated={handleDIDCreated}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;

