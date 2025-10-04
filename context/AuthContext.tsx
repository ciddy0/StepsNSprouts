import { initializeNewUser } from "@/services/api/userService";
import { emailSetUP, emailSignIn, listenToAuth, logOut } from "@/services/firebase/auth";
import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, username: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToAuth((currentUser) => {
            console.log('Auth state changed:', currentUser?.email || 'No user');
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        signIn: async (email: string, password: string) => {
            await emailSignIn(email, password);
        },
        signUp: async (email: string, password: string, username: string) => {
            const userCredential = await emailSetUP(email, password);
            await initializeNewUser(userCredential.user, username);
        },
        signOut: async () => {
            await logOut();
        },
    }), [user, loading]);

    return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

export const useAuth = () => {
    return useContext(AuthContext);
};