# IPFS Setup Guide

## Why You're Getting Mock/Test Hashes

If you're seeing warnings about "test/mock hash", it means your backend is not configured with a real IPFS service. The system is generating mock hashes for development purposes, which won't work on real IPFS gateways.

## Solution: Configure Pinata (Recommended)

Pinata is a reliable IPFS pinning service that ensures your files are always accessible.

### Step 1: Get Pinata API Keys

1. Go to [Pinata Cloud](https://pinata.cloud)
2. Sign up for a free account
3. Go to **API Keys** section
4. Create a new API key
5. Copy your **API Key** and **Secret Key**

### Step 2: Configure Backend

1. Navigate to your backend directory:
   ```bash
   cd backend
   ```

2. Create or edit `.env` file:
   ```bash
   # Add these lines to your .env file
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_KEY=your_pinata_secret_key_here
   ```

3. Restart your backend server:
   ```bash
   npm start
   # or
   npm run dev
   ```

### Step 3: Verify Configuration

After configuring Pinata, when you upload a document:
- You should see "📤 Uploading to Pinata IPFS..." in the backend console
- You should see "✅ Successfully uploaded to Pinata: [hash]" 
- The IPFS hash will be exactly 46 characters (CIDv0 format)
- The hash will work on all IPFS gateways

## Alternative: Use Local IPFS Node

If you prefer to use a local IPFS node:

1. Install IPFS:
   ```bash
   # Using npm
   npm install -g ipfs
   
   # Or download from https://ipfs.io/install
   ```

2. Initialize and start IPFS:
   ```bash
   ipfs init
   ipfs daemon
   ```

3. Add to your backend `.env`:
   ```env
   USE_LOCAL_IPFS=true
   IPFS_HOST=127.0.0.1
   IPFS_PORT=5001
   ```

## Troubleshooting

### Error: "IPFS upload failed. Please configure Pinata API keys"

**Solution**: Add Pinata API keys to your `.env` file as shown above.

### Error: "form-data package is required for Pinata uploads"

**Solution**: Install the form-data package:
```bash
cd backend
npm install form-data
```

### Warning: "This appears to be a test/mock hash"

**Solution**: This means your backend is using mock hashes. Configure Pinata or a local IPFS node as described above.

## Free Pinata Account Limits

- Free tier: 1 GB storage, unlimited requests
- Perfect for development and testing
- Upgrade for production use

## Verification

After setup, upload a new document and check:
- ✅ IPFS hash is exactly 46 characters
- ✅ No "test/mock hash" warning
- ✅ Can view document on IPFS gateways
- ✅ Verification works correctly

