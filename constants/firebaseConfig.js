// constants/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCmzVT47V9C-Aiu3kawYrLAMBLHLIgsnyg",
  authDomain: "reactnative-2025-6fced.firebaseapp.com",
  databaseURL: "https://reactnative-2025-6fced-default-rtdb.firebaseio.com",
  projectId: "reactnative-2025-6fced",
  storageBucket: "reactnative-2025-6fced.firebasestorage.app",
  messagingSenderId: "951504180513",
  appId: "1:951504180513:web:4fade7e3e831c7efa29a60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };