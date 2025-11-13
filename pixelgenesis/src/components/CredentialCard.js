import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentIcon, 
  EyeIcon, 
  ShareIcon, 
  CheckBadgeIcon,
  CalendarIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import QRCodeGenerator from './QRCode';

function CredentialCard({ credential, onView, onShare }) {
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      certificate: 'bg-blue-100 text-blue-800',
      diploma: 'bg-green-100 text-green-800',
      license: 'bg-purple-100 text-purple-800',
      identity: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'certificate':
      case 'diploma':
        return <CheckBadgeIcon className="h-4 w-4" />;
      case 'license':
        return <DocumentIcon className="h-4 w-4" />;
      default:
        return <DocumentIcon className="h-4 w-4" />;
    }
  };

  const handleShare = () => {
    setShowQR(true);
    if (onShare) {
      onShare(credential);
    }
  };

  const handleVerify = () => {
    const ipfsHash = credential.cid || credential.ipfsHash;
    const txHash = credential.txHash || credential.blockchainHash;
    
    if (ipfsHash || txHash) {
      const params = new URLSearchParams();
      if (ipfsHash) params.append('hash', ipfsHash);
      if (txHash) params.append('tx', txHash);
      navigate(`/verify?${params.toString()}`);
    } else {
      alert('No IPFS hash or transaction hash available for verification');
    }
  };

  // Use public URL from environment or fallback to current origin
  const getPublicUrl = () => {
    // Check for public URL in environment variable
    const publicUrl = process.env.REACT_APP_PUBLIC_URL || process.env.REACT_APP_FRONTEND_URL;
    if (publicUrl) {
      return publicUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    // For production, use current origin
    // For development, you should set REACT_APP_PUBLIC_URL to your deployed URL
    return window.location.origin;
  };

  // Build shareable URL with CID and hash for global access
  const shareUrl = `${getPublicUrl()}/verify?cid=${credential.cid || credential.ipfsHash}${credential.txHash ? `&tx=${credential.txHash}` : ''}`;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {credential.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(credential.category)}`}>
              {getCategoryIcon(credential.category)}
              <span className="ml-1 capitalize">{credential.category}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVerify}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Verify Document"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onView && onView(credential)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Document"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Share Document"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {credential.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {credential.description}
        </p>
      )}

      {/* File Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <DocumentIcon className="h-4 w-4 mr-2" />
          <span>{credential.fileName}</span>
          <span className="mx-2">•</span>
          <span>{formatFileSize(credential.fileSize)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Created {formatDate(credential.createdAt)}</span>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-3">
        {(credential.cid || credential.ipfsHash) && (() => {
          const ipfsHash = credential.cid || credential.ipfsHash;
          const isMockHash = ipfsHash.length < 46; // Real CIDv0 hashes are 46 chars, CIDv1 are 59
          const isValidFormat = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(ipfsHash) || /^b[a-z2-7]{58}$/.test(ipfsHash);
          
          return (
            <div>
              <div className="text-xs text-gray-500 mb-1 font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <span>IPFS Hash (CID):</span>
                  {isMockHash ? (
                    <span className="ml-2 text-yellow-600 text-xs">⚠️ Test Hash</span>
                  ) : isValidFormat ? (
                    <span className="ml-2 text-green-600 text-xs">✓ On IPFS</span>
                  ) : (
                    <span className="ml-2 text-orange-600 text-xs">⚠️ Invalid Format</span>
                  )}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ipfsHash);
                    alert('IPFS Hash copied to clipboard!');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Copy IPFS Hash"
                >
                  Copy
                </button>
              </div>
              <div className="font-mono text-xs text-gray-700 break-all bg-white px-2 py-1 rounded border">
                {ipfsHash}
              </div>
              {isMockHash && (
                <div className="mt-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                  ⚠️ This appears to be a test/mock hash. Real IPFS hashes are 46 characters (CIDv0) or 59 characters (CIDv1). 
                  This hash may not work on IPFS gateways.
                </div>
              )}
              {!isMockHash && isValidFormat && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      // Handle potential 500 errors gracefully
                      e.preventDefault();
                      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    View on Pinata →
                  </a>
                  <a
                    href={`https://ipfs.io/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    View on IPFS.io →
                  </a>
                  <a
                    href={`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    View on Cloudflare →
                  </a>
                </div>
              )}
            </div>
          );
        })()}
        
        {(credential.txHash || credential.blockchainHash) && (
          <div>
            <div className="text-xs text-gray-500 mb-1 font-medium flex items-center justify-between">
              <span className="flex items-center">
                <span>Transaction Hash:</span>
                <span className="ml-2 text-green-600 text-xs">✓ On Blockchain</span>
              </span>
              <button
                onClick={() => {
                  const hash = credential.txHash || credential.blockchainHash;
                  navigator.clipboard.writeText(hash);
                  alert('Transaction Hash copied to clipboard!');
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
                title="Copy Transaction Hash"
              >
                Copy
              </button>
            </div>
            <div className="font-mono text-xs text-gray-700 break-all bg-white px-2 py-1 rounded border">
              {credential.txHash || credential.blockchainHash}
            </div>
            {(credential.txHash || credential.blockchainHash) && (
              <a
                href={`https://sepolia.etherscan.io/tx/${credential.txHash || credential.blockchainHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
              >
                View on Etherscan →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-green-600">
          <CheckBadgeIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Verified on Blockchain</span>
        </div>
        
        <div className="text-xs text-gray-500">
          ID: {credential.id}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Share Document
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Scan this QR code to verify the document
              </p>
              <p className="text-xs text-green-600 font-medium">
                ✓ Globally accessible - Anyone can scan and verify
              </p>
            </div>
            
            <div className="flex justify-center mb-4 bg-gray-50 p-4 rounded-lg">
              <QRCodeGenerator value={shareUrl} size={200} />
            </div>
            
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mb-2">Shareable URL:</p>
              <p className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded">
                {shareUrl}
              </p>
              {shareUrl.includes('localhost') && (
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Using localhost. Set REACT_APP_PUBLIC_URL for production.
                </p>
              )}
            </div>
            
            <div className="flex flex-col space-y-2 mb-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                This QR code can be scanned by anyone, anywhere in the world
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CredentialCard;
