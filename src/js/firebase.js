/* ========================================
   PhysicalAid — Firebase Configuration
   ======================================== */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function requiredEnv(key) {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

// ─── Firebase Config (from environment) ───
// Define these in .env.local (never commit secrets):
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_STORAGE_BUCKET
// VITE_FIREBASE_MESSAGING_SENDER_ID
// VITE_FIREBASE_APP_ID
const firebaseConfig = {
    apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requiredEnv('VITE_FIREBASE_APP_ID')
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ─── Auth Helpers ───
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Sign-in failed:', error);
        throw error;
    }
}

export async function signOutUser() {
    try {
        await fbSignOut(auth);
    } catch (error) {
        console.error('Sign-out failed:', error);
        throw error;
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}
