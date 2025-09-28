// services/steps/fallback.ts
import { HealthKitService } from "./healthKit";

/**
 * Dummy data service that mimics HealthKit responses
 * In order to test with Expo Go where HealthKit isn't available
 */

// Base step count
let BASE_DAILY_STEPS = 8500;

// Add some randomness
const getRandomVariation = (base: number, variance: number = 0.3): number => {
    const variation = (Math.random() -0.5) * 2 * variance;
    return Math.floor(base * (1 + variation));
};

// Get time-based multiplier (steps accumulate throughout the day)
const getTimeMultiplier = (): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeProgress = (currentHour + currentMinute / 60) / 24;
    
    // Steps accumulate more in active hours (7am-10pm)
    if (currentHour >= 7 && currentHour <= 22) {
        return Math.min(timeProgress * 1.2, 1.0);
    }
    return timeProgress * 0.8;
};

/**
 * Initialize dummy health service (always returns true for testing)
 */
export const initializeHealthKit = (): Promise<boolean> => {
    return Promise.resolve(true);
};

/**
 * Generate realistic step count for today
 */
export const getTodaysSteps = (): Promise<number> => {
  return new Promise((resolve) => {
    // Add a small delay to simulate network/processing time
    setTimeout(() => {
      const timeMultiplier = getTimeMultiplier();
      
      const baseSteps = getRandomVariation(BASE_DAILY_STEPS, 0.4);
      const finalSteps = Math.floor(baseSteps * timeMultiplier);
      
      // Ensure minimum steps for realism
      const steps = Math.max(finalSteps, 100);
      
      console.log(`[DummyData] Today's steps: ${steps} (${Math.round(timeMultiplier * 100)}% of day)`);
      resolve(steps);
    }, 100);
  });
};

export const dummyHealthService: HealthKitService = {
  initializeHealthKit,
  getTodaysSteps,
};