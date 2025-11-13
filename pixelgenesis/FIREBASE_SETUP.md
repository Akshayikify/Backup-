# Firebase Authentication Setup Guide

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase configuration

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `pixelgenesis` (or your preferred name)
4. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Click **Save**

### 3. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **test mode** (for development)
4. Choose a location for your database
5. Click **Enable**

### 4. Configure Firestore Security Rules

Update your Firestore rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Verifiers collection
    match /verifiers/{verifierId} {
      allow read, write: if request.auth != null && request.auth.uid == verifierId;
    }
  }
}
```

### 5. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web** icon (`</>`)
4. Register your app
5. Copy the configuration object

### 6. Configure Environment Variables

Create `.env` file in `pixelgenesis/` directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8000

# Public URL for QR codes
REACT_APP_PUBLIC_URL=http://localhost:3000
```

### 7. Install Dependencies

```bash
cd pixelgenesis
npm install
```

## Firestore Collections Structure

### `users` Collection
```javascript
{
  username: string,
  email: string,
  walletAddress: string,
  role: 'user',
  did: string,
  didId: number,
  metadataHash: string,
  txHash: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `verifiers` Collection
```javascript
{
  username: string,
  email: string,
  organization: string,
  role: 'verifier',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Authentication Flow

### User Registration Flow:
1. User enters username, email, password
2. User connects wallet
3. User creates DID
4. Firebase account created
5. User data saved to Firestore `users` collection
6. Redirect to User Dashboard

### User Login Flow:
1. User enters email and password
2. User connects wallet
3. Firebase authentication
4. Fetch user data from Firestore
5. Verify wallet address matches
6. Redirect to User Dashboard

### Verifier Registration Flow:
1. Verifier enters username, email, password, organization
2. Firebase account created
3. Verifier data saved to Firestore `verifiers` collection
4. Redirect to Verifier Dashboard

### Verifier Login Flow:
1. Verifier enters email and password
2. Firebase authentication
3. Fetch verifier data from Firestore
4. Redirect to Verifier Dashboard

## Testing

1. **Test User Registration**:
   - Navigate to `/user-register`
   - Fill in form
   - Connect wallet
   - Create DID
   - Submit registration

2. **Test User Login**:
   - Navigate to `/user-login`
   - Enter credentials
   - Connect wallet
   - Sign in

3. **Test Verifier Registration**:
   - Navigate to `/verifier-register`
   - Fill in form
   - Submit registration

4. **Test Verifier Login**:
   - Navigate to `/verifier-login`
   - Enter credentials
   - Sign in

## Troubleshooting

### "Firebase: Error (auth/email-already-in-use)"
- Email is already registered
- Use login instead of register

### "Firebase: Error (auth/weak-password)"
- Password must be at least 6 characters

### "Firebase: Error (auth/invalid-email)"
- Check email format

### Firestore Permission Denied
- Check Firestore security rules
- Ensure user is authenticated
- Verify user ID matches document ID

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all Firebase config
3. **Set up proper Firestore rules** for production
4. **Enable Firebase App Check** for production
5. **Use Firebase Hosting** for production deployment

