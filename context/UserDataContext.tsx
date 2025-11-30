import { getTodaysStepsWithProgress } from "@/services/api/dailyStepsService";
import { checkAndUnlockAchievements, getUserDocument } from "@/services/api/userService";
import { User } from "@/services/firebase/collections/user";
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";

interface StepsData {
    steps: number;
    goal: number;
    progress: number;
    goalMet: boolean;
    remaining: number;
    lastSynced: string | null;
}

interface UserDataContextType {
    userData: User | null;
    stepsData: StepsData;
    isLoading: boolean;
    lastFetchTime: number | null;
    fetchData: (userId: string, forceRefresh?: boolean) => Promise<void>;
    clearCache: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const CACHE_DURATION_MS = 60 * 1000; // 1 minute

const DEFAULT_STEPS_DATA: StepsData = {
    steps: 0,
    goal: 10000,
    progress: 0,
    goalMet: false,
    remaining: 0,
    lastSynced: null,
};

export function UserDataProvider({ children }: { children: ReactNode }) {
    const [userData, setUserData] = useState<User | null>(null);
    const [stepsData, setStepsData] = useState<StepsData>(DEFAULT_STEPS_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const lastFetchTimeRef = useRef<number | null>(null);

    const fetchData = useCallback(async (userId: string, forceRefresh: boolean = false) => {
        const now = Date.now();

        // Check if cache is still valid (less than 1 minute old)
        if (!forceRefresh && lastFetchTimeRef.current && (now - lastFetchTimeRef.current) < CACHE_DURATION_MS) {
            console.log("[UserDataContext] Using cached data");
            return;
        }

        try {
            setIsLoading(true);
            console.log("[UserDataContext] Fetching fresh data...");

            const [userDoc, todaySteps] = await Promise.all([
                getUserDocument(userId),
                getTodaysStepsWithProgress(userId),
            ]);

            if (userDoc) {
                // Check for new achievements
                const unlockedIds = await checkAndUnlockAchievements(
                    userId,
                    todaySteps.steps,
                    userDoc.totalSteps,
                    userDoc.currentStreak
                );

                if (unlockedIds.length > 0) {
                    console.log("[UserDataContext] Unlocked achievements:", unlockedIds);
                    // Re-fetch user doc to get updated achievements and pomes
                    const updatedUserDoc = await getUserDocument(userId);
                    setUserData(updatedUserDoc);
                } else {
                    setUserData(userDoc);
                }
            } else {
                setUserData(null);
            }

            setStepsData(todaySteps);
            lastFetchTimeRef.current = now;

            console.log("[UserDataContext] Data fetched and cached");
        } catch (error) {
            console.error("[UserDataContext] Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependencies - stable reference

    const clearCache = useCallback(() => {
        setUserData(null);
        setStepsData(DEFAULT_STEPS_DATA);
        lastFetchTimeRef.current = null;
        console.log("[UserDataContext] Cache cleared");
    }, []);

    return (
        <UserDataContext.Provider
            value={{
                userData,
                stepsData,
                isLoading,
                lastFetchTime: lastFetchTimeRef.current,
                fetchData,
                clearCache,
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error("useUserData must be used within a UserDataProvider");
    }
    return context;
}
