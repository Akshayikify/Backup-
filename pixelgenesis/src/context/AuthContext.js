import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        
        // Try to get user data from 'users' path first
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const data = userSnapshot.val();
          setUserRole('user');
          setWalletAddress(data.walletAddress || '');
          setUserData(data);
        } else {
          // Try verifiers path
          const verifierRef = ref(db, `verifiers/${user.uid}`);
          const verifierSnapshot = await get(verifierRef);
          if (verifierSnapshot.exists()) {
            const data = verifierSnapshot.val();
            setUserRole('verifier');
            setUserData(data);
          }
        }
      } else {
        setFirebaseUser(null);
        setUserRole(null);
        setWalletAddress('');
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (role, wallet = '', additionalData = {}) => {
    setUserRole(role);
    setWalletAddress(wallet);
    setUserData(additionalData);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('userRole', role);
      if (wallet) {
        localStorage.setItem('walletAddress', wallet);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setWalletAddress('');
      setUserData(null);
      setFirebaseUser(null);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('walletAddress');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateWallet = (wallet) => {
    setWalletAddress(wallet);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (wallet) {
        localStorage.setItem('walletAddress', wallet);
      } else {
        localStorage.removeItem('walletAddress');
      }
    }
  };

  const value = {
    firebaseUser,
    userRole,
    walletAddress,
    userData,
    loading,
    login,
    logout,
    updateWallet,
    setFirebaseUser,
    isAuthenticated: !!firebaseUser && !!userRole,
    isUser: userRole === 'user',
    isVerifier: userRole === 'verifier'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

