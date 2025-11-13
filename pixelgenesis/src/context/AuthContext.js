import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => {
    // Load role from localStorage on initialization
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userRole') || null;
    }
    return null;
  });
  const [walletAddress, setWalletAddress] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('walletAddress') || '';
    }
    return '';
  });

  const login = (role, wallet = '') => {
    setUserRole(role);
    setWalletAddress(wallet);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('userRole', role);
      if (wallet) {
        localStorage.setItem('walletAddress', wallet);
      }
    }
  };

  const logout = () => {
    setUserRole(null);
    setWalletAddress('');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('walletAddress');
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
    userRole,
    walletAddress,
    login,
    logout,
    updateWallet,
    isAuthenticated: !!userRole,
    isUser: userRole === 'user',
    isVerifier: userRole === 'verifier'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

