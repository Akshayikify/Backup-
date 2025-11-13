import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import CredentialCard from '../components/CredentialCard';
import { 
  ShieldCheckIcon,
  ArrowLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';

function MyDocs() {
  const [connectedAccount, setConnectedAccount] = useState('');
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'diploma', label: 'Diplomas' },
    { value: 'license', label: 'Licenses' },
    { value: 'identity', label: 'Identity Documents' },
    { value: 'other', label: 'Other' }
  ];

  // Mock documents data
  const mockDocuments = [
    {
      id: 1,
      title: "Bachelor's Degree in Computer Science",
      description: "University degree certificate from MIT",
      category: "diploma",
      fileName: "degree_certificate.pdf",
      fileSize: 2048576,
      fileType: "application/pdf",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590C4C87",
      createdAt: "2024-01-15T10:30:00.000Z",
      version: "1.0"
    },
    {
      id: 2,
      title: "Professional Driver's License",
      description: "Commercial driving license valid until 2028",
      category: "license",
      fileName: "drivers_license.jpg",
      fileSize: 1024000,
      fileType: "image/jpeg",
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590C4C87",
      createdAt: "2024-02-10T14:20:00.000Z",
      version: "1.0"
    },
    {
      id: 3,
      title: "AWS Cloud Practitioner Certificate",
      description: "Amazon Web Services certification for cloud fundamentals",
      category: "certificate",
      fileName: "aws_certificate.pdf",
      fileSize: 512000,
      fileType: "application/pdf",
      ipfsHash: "QmPZ9gcCEpqKTo6aq61g4nD2v7DDCAQ7X1VA6mHZ9sa8di",
      txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590C4C87",
      createdAt: "2024-03-05T09:15:00.000Z",
      version: "1.0"
    },
    {
      id: 4,
      title: "National Identity Card",
      description: "Government issued identity document",
      category: "identity",
      fileName: "national_id.jpg",
      fileSize: 800000,
      fileType: "image/jpeg",
      ipfsHash: "QmRAQB6YaCyidP37UdDnjFY5vQuiBrcqdyoW1CuDgwxkD4",
      txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590C4C87",
      createdAt: "2024-01-20T16:45:00.000Z",
      version: "1.0"
    },
    {
      id: 5,
      title: "Medical Certificate",
      description: "Health clearance certificate for employment",
      category: "certificate",
      fileName: "medical_cert.pdf",
      fileSize: 300000,
      fileType: "application/pdf",
      ipfsHash: "QmYHNbxLogEVWffBsbUpxVEjPZBMcKGKupo8DtCFwShiHu",
      txHash: "0x1357924680acefbd1357924680acefbd1357924680acefbd1357924680acefbd",
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590C4C87",
      createdAt: "2024-02-28T11:30:00.000Z",
      version: "1.0"
    }
  ];

  useEffect(() => {
    if (connectedAccount) {
      loadUserDocuments();
    }
  }, [connectedAccount]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory]);

  const loadUserDocuments = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch from the blockchain
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleWalletConnected = (account) => {
    setConnectedAccount(account);
  };

  const handleViewDocument = (document) => {
    // In a real app, this would open the document viewer
    console.log('Viewing document:', document);
    alert(`Viewing document: ${document.title}\nIPFS Hash: ${document.ipfsHash}`);
  };

  const handleShareDocument = (document) => {
    // This is handled by the CredentialCard component
    console.log('Sharing document:', document);
  };

  const goBack = () => {
    navigate('/dashboard');
  };

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
              Please connect your MetaMask wallet to view your documents
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
              <button
                onClick={goBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Upload New
              </button>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Documents
          </h2>
          <p className="text-gray-600">
            Manage and share your verified documents stored on the blockchain
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <CredentialCard
                key={document.id}
                credential={document}
                onView={handleViewDocument}
                onShare={handleShareDocument}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentPlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first document to get started'
              }
            </p>
            {(!searchTerm && selectedCategory === 'all') && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Upload Document
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {documents.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Document Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.category === 'certificate').length}
                </p>
                <p className="text-sm text-gray-600">Certificates</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {documents.filter(d => d.category === 'diploma').length}
                </p>
                <p className="text-sm text-gray-600">Diplomas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {documents.filter(d => d.category === 'license').length}
                </p>
                <p className="text-sm text-gray-600">Licenses</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyDocs;
