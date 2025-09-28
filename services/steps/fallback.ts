// services/steps/fallback.ts
import { HealthKitService } from "./healthKit";

/**
 * Fallback Health data Service
 * 
 * Dummy data service that mimics HealthKit responses
 * In order to test with Expo Go where HealthKit isn't available
 * 
 * Features:
 * - Realistic step count simulation
 * 
 * @implements {HealthKitService}
 * @platform All - WOrks on IOS, Andriod, Web, and Expo Go
 */

// Base step count (zoph's average step LMAO)
let BASE_DAILY_STEPS = 300;

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
 * 
 * Creates a simulated step count that progresses throughout the day.
 * The count increases as the day progresses, with realistic variations
 * and time-based accumulation patterns.
 * 
 * Algorithm:
 * 1. Apply random variation to base step count (±40%)
 * 2. Apply time-based multiplier for current time of day
 * 3. Ensure minimum step count for realism (100 steps minimum)
 * 4. Add network delay simulation (100ms)
 * 
 * @returns {Promise<number>} Promise resolving to today's simulated step count
 *   - Range: 100 to (BASE_DAILY_STEPS * 1.4) depending on time of day
 *   - Updates in real-time as day progresses
 *   - Includes natural random variation
 * 
 * @example
 * ```typescript
 * // Morning (8AM): Might return 80 steps (partial day)
 * // Afternoon (2PM): Might return 180 steps (more progress)
 * // Evening (9PM): Might return 280 steps (nearly full day)
 * 
 * const steps = await getTodaysSteps();
 * console.log(`Current step count: ${steps}`);
 * ```
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