
// Context for managing user authentication state and actions
import { emailSetUP, emailSignIn, listenToAuth, logOut } from "@/services/firebase/auth";
import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    // Current authenticated user or null if not authenticated
    user: User | null;
    // Loading state to indicate if authentication status is being checked
    loading: boolean;
    // Function to sign up a new user
    signUp: (email: string, password: string) => Promise<void>;
    // Function to sign in an existing user
    signIn: (email: string, password: string) => Promise<void>;
    // Function to sign out the current user
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    // Current authenticated user or null if not authenticated
    user: null,
    // Loading state to indicate if authentication status is being checked
    loading: true,
    // Functions to sign in, sign out, and sign up an existing user
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});
// Provides authentication context to the app
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Sets up a listener for authentication state changes
    useEffect(() => {
        const unsubscribe = listenToAuth((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Memoizes the context value to optimize performance
    const value = useMemo(() => ({
        user,
        loading,
        // Functions to sign in, sign out, and sign up an existing user
        signIn: async (email: string, password: string) => {
            await emailSignIn(email, password);
        },
        signUp: async (email: string, password: string) => {
            await emailSetUP(email, password);
        },
        signOut: async () => {
            await logOut();
        },
    }), [user, loading]); // Dependencies to recompute the memoized value

    // Provides the authentication context to child components
    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

// Custom hook to access the authentication context
export const useAuth = () => {
    return useContext(AuthContext); // Returns the current context value for authentication
};
