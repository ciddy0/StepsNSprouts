// services/firebase/auth.ts
//Imports the Firebase authentication instance
import { auth } from './config';
//Imports necessary functions and types from Firebase
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from 'firebase/auth';

//Function to handle user sign-up with email and password
export const emailSetUP = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

//Function to handle user sign-in with email and password
export const emailSignIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

//Function to handle user sign-out
export const logOut = () => {
    return signOut(auth);
}

//Function to listen to authentication state changes
export const listenToAuth = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}

//Function to sign in with Google ID token
export const signInWithGoogleIdToken = (idToken: string) => {
    const googleCredential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, googleCredential);
}

export const useGoogleAuth = () => {
    // Force using Expo's auth proxy
    const redirectUri = makeRedirectUri({
        native: 'https://auth.expo.io/@ciddy0/StepsNSprouts',
    });

    return Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        redirectUri,
    });
}