import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import WalletConnect from './WalletConnect';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { login, setFirebaseUser } = useAuth();
  const navigate = useNavigate();

  const handleWalletConnected = (account) => {
    setWalletAddress(account);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet to continue');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Signing in...', { id: 'login' });

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Realtime Database
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        toast.error('User not found. Please register first.', { id: 'login' });
        await auth.signOut();
        return;
      }

      const userData = snapshot.val();

      // Verify user role
      if (userData.role !== 'user') {
        toast.error('This account is not registered as a user. Please use verifier login.', { id: 'login' });
        await auth.signOut();
        return;
      }

      // Verify wallet address matches
      if (userData.walletAddress && userData.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        toast.error('Wallet address does not match registered address', { id: 'login' });
        await auth.signOut();
        return;
      }

      // Update wallet if not set
      if (!userData.walletAddress && walletAddress) {
        // Update user document with wallet address
        // This would be done via backend API in production
      }

      // Set Firebase user and login
      setFirebaseUser(firebaseUser);
      login('user', walletAddress, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: userData.username,
        did: userData.did,
        didId: userData.didId,
        metadataHash: userData.metadataHash,
        txHash: userData.txHash,
        walletAddress: userData.walletAddress || walletAddress
      });

      toast.success('Logged in successfully!', { id: 'login' });
      navigate('/user-dashboard');

    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      toast.error(errorMessage, { id: 'login' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <UserIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Login
          </h1>
          <p className="text-gray-600">
            Sign in to manage your documents
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-3">
              <strong>Note:</strong> Wallet connection is required for users
            </p>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password || !walletAddress}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isLoading || !email || !password || !walletAddress
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/user-register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register as User
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;

