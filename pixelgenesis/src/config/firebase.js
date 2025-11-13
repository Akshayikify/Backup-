import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKc3nhoaTfuJxZ_mWef4uut0axQsncUFs",
  authDomain: "blockchain-vault-de150.firebaseapp.com",
  projectId: "blockchain-vault-de150",
  storageBucket: "blockchain-vault-de150.firebasestorage.app",
  messagingSenderId: "53181207728",
  appId: "1:53181207728:web:563b211712b290a5009775",
  measurementId: "G-2YM9F1CKXK",
  databaseURL: "https://blockchain-vault-de150-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);

export default app;

