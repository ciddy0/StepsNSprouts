
// Imports the Firebase authentication instance
import { auth } from './config';
// Imports necessary functions and types from Firebase
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from 'firebase/auth';

// Function to handle user sign-up with email and password
export const emailSetUP = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Function to handle user sign-in with email and password
export const emailSignIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

// Function to handle user sign-out
export const logOut = () => {
    return signOut(auth);
}

// Function to listen to authentication state changes
export const listenToAuth = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}