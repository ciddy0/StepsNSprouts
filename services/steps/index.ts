// services/steps/index.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { dummyHealthService } from './fallback';
import type { HealthKitService } from './healthKit';
import { healthKitService } from './healthKit';

// detect if app is in Expo go or dev environment
const isExpoGo = Constants.appOwnership === 'expo';
const isDevelopment = __DEV__;

// Determine which service to use
const getHealthService = (): HealthKitService => {
    if (isExpoGo) {
        console.log('[HealthService] Using Dummy data');
        return dummyHealthService;
    }

    if (isDevelopment) {
        const useDummyInDev = true;
        if (useDummyInDev) {
            console.log('[HealthService] Using dummy data');
            return dummyHealthService;
        }
    }

    if (Platform.OS === 'ios') {
        console.log('[HealthService] Using Healthkit');
        return healthKitService;
    }

    // fallback just in caseee
    console.log('[HealthService] Using dummy data (fallback)');
    return dummyHealthService;
};

const healthService = getHealthService();

// export the selected service methods
export const initializeHealthKit = healthService.initializeHealthKit;
export const getTodaysSteps = healthService.getTodaysSteps;

// export types for use in other parts of the app
export type { HealthKitService, StepData } from './healthKit';

// Convenience function with goal progress
export const getTodaysProgress = async (goal: number = 10000) => {
    const steps = await getTodaysSteps();
    const progress = Math.min(steps / goal, 1);
    const goalMet = steps >= goal;
    
    return {
        steps,
        goal,
        progress,
        goalMet,
        remaining: Math.max(goal - steps, 0),
    };
};

// Initialize the health service when module loads
let isInitialized = false;

export const ensureHealthServiceInitialized = async (): Promise<boolean> => {
    if (isInitialized) {
        return true;
    }
    
    try {
        const success = await initializeHealthKit();
        isInitialized = success;
        
        if (success) {
        console.log('[HealthService] Initialized successfully');
        } else {
        console.error('[HealthService] Initialization failed');
        }
        
        return success;
    } catch (error) {
        console.error('[HealthService] Initialization error:', error);
        return false;
    }
};