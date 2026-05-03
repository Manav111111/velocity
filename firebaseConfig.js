import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration
// We use Constants.expoConfig.extra for production reliability
// and hardcoded fallbacks as a safety measure for the APK build.
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey || "AIzaSyAMox6OzfkkgaXK3qd3ep7jc7Ov5djL1Do",
  authDomain: Constants.expoConfig?.extra?.firebase?.authDomain || "velocity-pro.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebase?.projectId || "velocity-pro",
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket || "velocity-pro.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId || "845684833636",
  appId: Constants.expoConfig?.extra?.firebase?.appId || "1:845684833636:web:e5b7c50ae8b21e01f6ce71",
  measurementId: Constants.expoConfig?.extra?.firebase?.measurementId || "G-P9HZTKTQV3"
};

let app;
let auth;
let db;

try {
  // Initialize Firebase only if it hasn't been initialized yet
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Auth with persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

  // Initialize Firestore
  db = getFirestore(app);

  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback to basic auth/db if already initialized or if initialization fails partially
  try {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Critical: Could not even recover Firebase app", e);
  }
}

export { auth, db };
