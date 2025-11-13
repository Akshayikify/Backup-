import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

function WalletConnect({ onWalletConnected }) {
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const handleAccountChange = useCallback(
    (accounts) => {
      const nextAccount = accounts && accounts.length > 0 ? accounts[0] : '';
      setAccount(nextAccount);
      if (onWalletConnected) {
        onWalletConnected(nextAccount);
      }
      if (!nextAccount) {
        toast.success('Wallet disconnected');
      }
    },
    [onWalletConnected]
  );

  const handleDisconnect = useCallback(() => {
    handleAccountChange([]);
  }, [handleAccountChange]);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (!window.ethereum.removeListener) return;
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [handleAccountChange, handleDisconnect]);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          handleAccountChange(accounts);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      handleAccountChange(accounts);
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setAccount('');
    try {
      if (window.ethereum?.request) {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        });
      }
      toast.success('Wallet disconnected');
    } catch (error) {
      console.warn('Wallet revoke permissions not supported or failed:', error);
      toast('Disconnect requested. If the wallet remains connected, please disconnect from MetaMask directly.', {
        icon: '⚠️'
      });
    } finally {
      if (onWalletConnected) {
        onWalletConnected('');
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-connect">
      {account ? (
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium">
              Connected: {formatAddress(account)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      )}
    </div>
  );
}

export default WalletConnect;
