//Initialize Firebase
import { getApp, getApps, initializeApp } from "firebase/app";
//Authentication modules from Firebase SDK
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
//React Native specific authentication persistence
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { Platform } from "react-native";
//Firestore and Storage modules from Firebase
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

//Firebase configuration from environment variables in Expo (.env)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

//Prevents re-initialization of the app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

//Creates a variable to hold the auth instance
let auth: Auth;

//Uses platform specific code to initialize the auth instance
if (Platform.OS === "web") {
    auth = getAuth(app);
    //Set persistence to local (default is session)
    setPersistence(auth, browserLocalPersistence);
} else {
    //Uses AsyncStorage for persistence
    try {
        //Attempts to initialize auth with React Native persistence
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch (error) {
        //If already initialized, get the existing instance
        auth = getAuth(app);
    }
}

//Initialize Firestore and Storage instances
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

//Exports the initialized Firebase app and auth instance for use in the app
export { app, auth, db, storage };

