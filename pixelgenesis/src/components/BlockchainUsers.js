import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { generateMockBlockchainUsers } from '../utils/blockchainUsers';
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  DocumentIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

function BlockchainUsers({ currentUserWallet }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real users from Firebase
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      const realUsers = [];
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        Object.keys(usersData).forEach((uid) => {
          const user = usersData[uid];
          realUsers.push({
            uid,
            ...user,
            documentsCount: 0, // You can fetch this from documents collection
            verifiedDocuments: 0,
            joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            status: 'active'
          });
        });
      }

      // Combine real users with mock users for simulation
      const mockUsers = generateMockBlockchainUsers();
      
      // Filter out current user from mock users if they match
      const filteredMockUsers = mockUsers.filter(
        mockUser => mockUser.walletAddress.toLowerCase() !== currentUserWallet?.toLowerCase()
      );

      // Combine and set users
      setUsers([...realUsers, ...filteredMockUsers]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock users only
      const mockUsers = generateMockBlockchainUsers();
      setUsers(mockUsers.filter(
        mockUser => mockUser.walletAddress.toLowerCase() !== currentUserWallet?.toLowerCase()
      ));
      setLoading(false);
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading blockchain users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">
            Blockchain Network Users
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {users.length} {users.length === 1 ? 'user' : 'users'} on network
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No users found on the blockchain network</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user.uid || index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <UserCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.username || user.email || 'Anonymous User'}
                    </h3>
                    {user.role && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {user.role}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-mono">{formatWalletAddress(user.walletAddress)}</span>
                    </div>
                    
                    {user.did && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">DID:</span>
                        <span className="font-mono text-xs">{user.did.substring(0, 20)}...</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{user.documentsCount || 0} documents</span>
                      {user.verifiedDocuments > 0 && (
                        <span className="ml-2 text-green-600">
                          ({user.verifiedDocuments} verified)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Joined {user.joinedDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className={`w-3 h-3 rounded-full ${
                    user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Showing users from the blockchain network. Real users are fetched from Firebase, 
          additional users are simulated for demonstration.
        </p>
      </div>
    </div>
  );
}

export default BlockchainUsers;

