// Utility to simulate blockchain users and fetch all users from Firebase

/**
 * Generate mock blockchain users for simulation
 * This simulates users that would exist on the blockchain
 */
export const generateMockBlockchainUsers = () => {
  const mockUsers = [
    {
      uid: 'mock-user-1',
      username: 'Alice Johnson',
      email: 'alice@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      did: 'did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      didId: 1001,
      role: 'user',
      documentsCount: 12,
      verifiedDocuments: 10,
      joinedDate: '2024-01-15',
      status: 'active'
    },
    {
      uid: 'mock-user-2',
      username: 'Bob Smith',
      email: 'bob@example.com',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c22C9c8',
      did: 'did:ethr:0x8ba1f109551bD432803012645Hac136c22C9c8',
      didId: 1002,
      role: 'user',
      documentsCount: 8,
      verifiedDocuments: 7,
      joinedDate: '2024-02-20',
      status: 'active'
    },
    {
      uid: 'mock-user-3',
      username: 'Carol Williams',
      email: 'carol@example.com',
      walletAddress: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      did: 'did:ethr:0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      didId: 1003,
      role: 'user',
      documentsCount: 15,
      verifiedDocuments: 14,
      joinedDate: '2024-01-08',
      status: 'active'
    },
    {
      uid: 'mock-user-4',
      username: 'David Brown',
      email: 'david@example.com',
      walletAddress: '0x1234567890123456789012345678901234567890',
      did: 'did:ethr:0x1234567890123456789012345678901234567890',
      didId: 1004,
      role: 'user',
      documentsCount: 5,
      verifiedDocuments: 4,
      joinedDate: '2024-03-10',
      status: 'active'
    },
    {
      uid: 'mock-user-5',
      username: 'Eva Davis',
      email: 'eva@example.com',
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      did: 'did:ethr:0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      didId: 1005,
      role: 'user',
      documentsCount: 20,
      verifiedDocuments: 18,
      joinedDate: '2023-12-05',
      status: 'active'
    },
    {
      uid: 'mock-user-6',
      username: 'Frank Miller',
      email: 'frank@example.com',
      walletAddress: '0x9876543210987654321098765432109876543210',
      did: 'did:ethr:0x9876543210987654321098765432109876543210',
      didId: 1006,
      role: 'user',
      documentsCount: 3,
      verifiedDocuments: 2,
      joinedDate: '2024-04-01',
      status: 'active'
    }
  ];

  return mockUsers;
};

