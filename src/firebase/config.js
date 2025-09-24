import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB9DxW1T3nQ4HyBhbiVAoj6sPwIBgCsgaw",
  authDomain: "thahbeeb-arts-fest.firebaseapp.com",
  projectId: "thahbeeb-arts-fest",
  storageBucket: "thahbeeb-arts-fest.firebasestorage.app",
  messagingSenderId: "708770309724",
  appId: "1:708770309724:web:ff8b63ff5090e0334ae899",
  measurementId: "G-4LKQP8FG67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
