/* ========================================
   PhysicalAid — Firebase Configuration
   ======================================== */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─── Firebase Config ───
// Replace these values with your own Firebase project config
// Go to: Firebase Console → Project Settings → General → Your Apps → Web App
const firebaseConfig = {
    apiKey: "REDACTED_API_KEY",
    authDomain: "physicalaid.firebaseapp.com",
    projectId: "physicalaid",
    storageBucket: "physicalaid.firebasestorage.app",
    messagingSenderId: "1003160071512",
    appId: "1:1003160071512:web:33e275316927242695c92d"
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
