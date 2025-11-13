# PixelGenesis Backend API

Backend API for PixelGenesis Blockchain Document Vault using Node.js, Express.js, MongoDB, IPFS, and Ethereum.

## 🚀 Features

- **DID Management**: Create and manage Decentralized Identifiers (DIDs)
- **Document Upload**: Upload documents to IPFS with unique CID generation
- **Credential Management**: Issue, verify, and revoke credentials
- **Blockchain Integration**: Store hashes and metadata on Ethereum blockchain
- **User Management**: User profiles and statistics
- **Audit Logging**: Complete audit trail of all operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- IPFS node (optional - can use Pinata)
- Ethereum node or RPC endpoint (optional for development)

## 🛠️ Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/pixelgenesis
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
FRONTEND_URL=http://localhost:3000
```

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### DID Endpoints

- `POST /api/did/create` - Create a new DID
- `GET /api/did/:walletAddress` - Get DID by wallet address

### Credential Endpoints

- `POST /api/credential/issue` - Issue a new credential
- `POST /api/credential/verify` - Verify a credential
- `GET /api/credential/:id` - Get credential by ID
- `GET /api/credential/owner/:walletAddress` - Get credentials by owner
- `POST /api/credential/revoke` - Revoke a credential

### IPFS Endpoints

- `POST /api/ipfs/upload` - Upload file to IPFS
- `POST /upload` - Legacy upload endpoint
- `GET /api/ipfs/:cid` - Get file from IPFS

### User Endpoints

- `GET /api/user/:walletAddress` - Get user by wallet address
- `GET /api/user/:walletAddress/stats` - Get user statistics
- `POST /api/user` - Create or update user

## 📁 Project Structure

```
backend/
├── server.js                 # Main Express server
├── package.json              # Dependencies
├── config/                  # Configuration files
│   ├── db.js                # MongoDB connection
│   ├── ipfsConfig.js        # IPFS client setup
│   └── blockchainConfig.js  # Blockchain provider setup
├── controllers/             # Request handlers
│   ├── didController.js
│   ├── credentialController.js
│   ├── ipfsController.js
│   └── userController.js
├── models/                  # MongoDB models
│   ├── User.js
│   ├── Credential.js
│   └── Log.js
├── routes/                  # API routes
│   ├── didRoutes.js
│   ├── credentialRoutes.js
│   ├── ipfsRoutes.js
│   └── userRoutes.js
├── services/                # Business logic
│   ├── blockchainService.js
│   ├── ipfsService.js
│   ├── cryptoService.js
│   └── didService.js
├── smart-contracts/         # Solidity contracts
│   ├── DIDRegistry.sol
│   └── CredentialStore.sol
└── utils/                   # Utility functions
    ├── generateHash.js
    ├── verifySignature.js
    ├── errorHandler.js
    └── asyncHandler.js
```

## 🔗 Frontend Integration

The backend is designed to work seamlessly with the React frontend. Update the frontend API configuration:

```javascript
// In frontend src/utils/api.js
const BASE_URL = 'http://localhost:8000';
```

## 🧪 Testing

The backend includes mock implementations for development when blockchain/IPFS services are not configured. This allows development without setting up full infrastructure.

## 📝 Notes

- MongoDB connection is optional - the app will continue without it in development mode
- IPFS can use local node or Pinata service
- Blockchain integration uses ethers.js and supports mock mode for development
- All file uploads are limited to 10MB
- Supported file types: JPEG, PNG, PDF, TXT

## 🔒 Security

- Input validation on all endpoints
- File type and size restrictions
- CORS configuration
- Error handling middleware
- Audit logging for all operations

## 📄 License

ISC

