// services/setps/healthkit.ts

/**
 * HealthKit Integration Service for Step Tracking
 * 
 * This module provides IOS healthkit integration for getting step count data.
 * 
 * Features:
 * - IOS healthkit permission handling
 * - Today's step count retrieval
 * - TS interfaces for type safety
 * 
 * @requires react-native-health - IOS HealthKit bridge lib
 * @platform IOS - HealthKit is only available on IOS devices
 */

import { Platform } from 'react-native';
import AppleHealthKit, {
    HealthInputOptions,
    HealthKitPermissions,
    HealthValue,
} from 'react-native-health';

/**
 * Step data structure returned by HealthKit
 * Used for consistent data format across the application
 * 
 * @interface StepData
 * @property {number} value - The step count value
 * @property {string} date - ISO date string when steps were recorded
 * @property {string} source - Data source identifier (e.g., 'HealthKit', 'DummyData')
 */
 export interface StepData {
    value: number;
    date: string;
    source: string;
 }

 /**
 * HealthKit service interface
 * Defines the contract for health data services (real HealthKit or dummy data)
 * 
 * @interface HealthKitService
 * @method initializeHealthKit - Initialize the health service with perms
 * @method getTodaysSteps - Retrieve step count for the current day
 */
 export interface HealthKitService {
    initializeHealthKit: () => Promise<boolean>;
    getTodaysSteps: () => Promise<number>;
 }

 // healthkit perms that we need :D
const permissions: HealthKitPermissions = {
    permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
        write: [],
    },
};

/**
 * Initialize healthkit with required perms
 */
export const initializeHealthKit = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (Platform.OS != 'ios'){
            console.log('Healthkit is only available on IOS');
            resolve(false)
            return;
        }

        AppleHealthKit.initHealthKit(permissions, (error: string) => {
            if (error) {
                console.log('HealthKit initializatio failed: ', error);
                resolve(false);
            } else {
                console.log('HealthKit initialized successfully')
                resolve(true);
            }
        });
    });
};

/**
 * Get today's step count
 */
export const getTodaysSteps = (): Promise<number> => {
    return new Promise((resolve, reject) => {
        // get current day boundaries
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 99);

        const options: HealthInputOptions = {
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString(),
        };

        AppleHealthKit.getStepCount(options, (callbackError: string, results: HealthValue) => {
            if (callbackError) {
                console.error('Error fetching today\'s steps:', callbackError);
                reject(new Error(callbackError));
            } else {
                const steps = results?.value || 0;
                console.log(`[HealthKit] Today's steps: ${steps}`);
                resolve(steps);
            }
        });
    });
};

export const healthKitService: HealthKitService = {
    initializeHealthKit,
    getTodaysSteps,
};