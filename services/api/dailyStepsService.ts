// ============================================================================
// services/dailyStepsService.ts
// ============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";
import { DailySteps } from "../firebase/collections/dailySteps";
import { db } from "../firebase/config";
import { getTodaysSteps } from "../steps";
import { getUserDocument, updateUserGarden, updateUserProfile } from "./userService";

/**
 * Get daily steps for a specific date
 */
export async function getDailySteps(
  userId: string,
  date: string
): Promise<DailySteps | null> {
  const dailyStepsRef = doc(db, 'users', userId, 'dailySteps', date);
  const docSnap = await getDoc(dailyStepsRef);

  if (docSnap.exists()) {
    return docSnap.data() as DailySteps;
  }
  return null;
}

/**
 * Create or update daily steps
 */
export async function setDailySteps(
  userId: string,
  date: string,
  steps: number
): Promise<void> {
  const dailyStepsRef = doc(db, `users/${userId}/dailySteps`, date);

  // Get previous steps for this day (if any)
  const existingDaySteps = await getDailySteps(userId, date);
  const previousSteps = existingDaySteps?.steps || 0;

  // Only update if steps have increased (prevents overwriting with lower values during simulation/sync issues)
  if (steps <= previousSteps) {
    console.log(`[DailySteps] Skipping update: new steps (${steps}) <= previous steps (${previousSteps})`);
    return;
  }

  const dailyStepsData: DailySteps = {
    id: date,
    userId,
    date,
    steps,
    lastSynced: new Date().toISOString()
  };

  await setDoc(dailyStepsRef, dailyStepsData);

  // Calculate the difference in steps
  const stepDifference = steps - previousSteps;

  // Update user's total steps
  await updateTotalSteps(userId);

  // Update tree's totalStepsContributed if there are new steps
  if (stepDifference > 0) {
    await updateTreeSteps(userId, stepDifference);
  }
}

/**
 * Update tree's totalStepsContributed and calculate growth level
 */
async function updateTreeSteps(userId: string, additionalSteps: number): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");

  const tree = { ...user.garden.tree };
  tree.totalStepsContributed += additionalSteps;

  // Growth logic: every 10,000 steps = 1 growth level (max level 6)
  tree.growthLevel = Math.min(Math.floor(tree.totalStepsContributed / 10000), 6);

  await updateUserGarden(userId, { tree });

  console.log(`[Tree] Updated: +${additionalSteps} steps, total: ${tree.totalStepsContributed}, level: ${tree.growthLevel}`);
}

/**
 * Sync today's steps from HealthKit to Firestore
 * Call this function periodically to keep steps data fresh
 */
export async function syncTodaysStepsFromHealthKit(userId: string): Promise<{
  steps: number;
  synced: boolean;
}> {
  try {
    // Get steps from HealthKit/device
    const steps = await getTodaysSteps();

    // Get today's date in ISO format
    const today = new Date().toISOString().split('T')[0];

    // Save to Firestore (this will also update tree)
    await setDailySteps(userId, today, steps);

    // Update streak after syncing
    await updateStreak(userId);

    console.log(`[DailySteps] Synced ${steps} steps for ${today}`);

    return { steps, synced: true };
  } catch (error) {
    console.error('[DailySteps] Failed to sync steps:', error);
    return { steps: 0, synced: false };
  }
}

/**
 * Get today's steps with goal progress
 * Combines HealthKit data with user's step goal
 */
export async function getTodaysStepsWithProgress(userId: string): Promise<{
  steps: number;
  goal: number;
  progress: number;
  goalMet: boolean;
  remaining: number;
  lastSynced: string | null;
}> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");

  const today = new Date().toISOString().split('T')[0];
  const todaySteps = await getDailySteps(userId, today);

  // Use cached data if available, otherwise return zeros
  // Syncing should be done explicitly via syncTodaysStepsFromHealthKit
  let steps: number = 0;
  let lastSynced: string | null = null;

  if (todaySteps) {
    steps = todaySteps.steps;
    lastSynced = todaySteps.lastSynced;
  }

  // Calculate progress based on cached steps
  const goal = user.stepGoal;
  const progress = Math.min(steps / goal, 1);
  const goalMet = steps >= goal;
  const remaining = Math.max(goal - steps, 0);

  return {
    steps,
    goal,
    progress,
    goalMet,
    remaining,
    lastSynced
  };
}

/**
 * Get daily steps for a date range
 */
export async function getDailyStepsRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailySteps[]> {
  const dailyStepsRef = collection(db, `users/${userId}/dailySteps`);
  const q = query(
    dailyStepsRef,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as DailySteps);
}

/**
 * Get most recent daily steps
 */
export async function getRecentDailySteps(
  userId: string,
  limitCount: number = 7
): Promise<DailySteps[]> {
  const dailyStepsRef = collection(db, `users/${userId}/dailySteps`);
  const q = query(
    dailyStepsRef,
    orderBy("date", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as DailySteps);
}

/**
 * Get weekly step summary
 */
export async function getWeeklyStepSummary(userId: string): Promise<{
  totalSteps: number;
  averageSteps: number;
  daysWithData: number;
  dailyBreakdown: DailySteps[];
}> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");

  const recentSteps = await getRecentDailySteps(userId, 7);

  const totalSteps = recentSteps.reduce((sum, day) => sum + (Number(day.steps) || 0), 0);
  const averageSteps = recentSteps.length > 0 ? Math.floor(totalSteps / recentSteps.length) : 0;

  return {
    totalSteps,
    averageSteps,
    daysWithData: recentSteps.length,
    dailyBreakdown: recentSteps
  };
}

/**
 * Calculate and update current streak
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get yesterday's and today's steps
  const [yesterdaySteps, todaySteps] = await Promise.all([
    getDailySteps(userId, yesterdayStr),
    getDailySteps(userId, todayStr)
  ]);

  let currentStreak = user.currentStreak || 0;

  // Check yesterday: if no document OR didn't meet goal → reset streak to 0
  if (!yesterdaySteps || yesterdaySteps.steps < user.stepGoal) {
    currentStreak = 0;
  }

  // Check today: if goal met AND we haven't counted today yet → increment
  const todayGoalMet = todaySteps && todaySteps.steps >= user.stepGoal;

  if (todayGoalMet) {
    // Only increment if we haven't already counted today
    // Check if the last streak update was before today
    const lastStreakDate = user.lastStreakUpdateDate || '';

    if (lastStreakDate < todayStr) {
      // This is the first time today we're counting the streak
      currentStreak += 1;

      // Update longest streak if needed
      const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

      await updateUserProfile(userId, {
        currentStreak,
        longestStreak,
        lastStreakUpdateDate: todayStr
      });

      return { currentStreak, longestStreak };
    }
  }

  // If we didn't increment (either goal not met or already counted today),
  // just update in case yesterday broke the streak
  const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

  await updateUserProfile(userId, {
    currentStreak,
    longestStreak,
    lastStreakUpdateDate: user.lastStreakUpdateDate || ''
  });

  return { currentStreak, longestStreak };
}
/**
 * Update user's total steps across all time
 */
async function updateTotalSteps(userId: string): Promise<void> {
  const dailyStepsRef = collection(db, `users/${userId}/dailySteps`);
  const querySnapshot = await getDocs(dailyStepsRef);

  let totalSteps = 0;
  querySnapshot.forEach(doc => {
    totalSteps += Number(doc.data().steps) || 0;
  });

  await updateUserProfile(userId, { totalSteps });
}

/**
 * Get today's steps (from cache or fresh sync)
 */
export async function getTodaySteps(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  // Try to get from cache first
  const todaySteps = await getDailySteps(userId, today);

  if (todaySteps) {
    // Check if data is stale (older than 5 minutes)
    const lastSynced = new Date(todaySteps.lastSynced);
    const now = new Date();
    const minutesSinceSync = (now.getTime() - lastSynced.getTime()) / (1000 * 60);

    if (minutesSinceSync < 5) {
      // Data is fresh, return cached value
      return todaySteps.steps;
    }
  }

  // Data is stale or doesn't exist, sync fresh data
  const syncResult = await syncTodaysStepsFromHealthKit(userId);
  return syncResult.steps;
}

/**
 * Force refresh today's steps from HealthKit
 * Use this when user pulls to refresh or manually requests sync
 */
export async function refreshTodaysSteps(userId: string): Promise<number> {
  const syncResult = await syncTodaysStepsFromHealthKit(userId);
  return syncResult.steps;
}

/**
 * Get step history for chart/visualization
 */
export async function getStepHistory(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; steps: number; goalMet: boolean }>> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");

  const recentSteps = await getRecentDailySteps(userId, days);

  return recentSteps.map(day => ({
    date: day.date,
    steps: day.steps,
    goalMet: day.steps >= user.stepGoal
  }));
}

/**
 * Auto-sync setup (call this on app launch or at intervals)
 * Sets up periodic syncing of step data
 */
export function setupAutoSync(
  userId: string,
  intervalMinutes: number = 15
): number {
  console.log(`[DailySteps] Setting up auto-sync every ${intervalMinutes} minutes`);

  // Initial sync
  syncTodaysStepsFromHealthKit(userId);

  // Setup periodic sync
  return setInterval(() => {
    syncTodaysStepsFromHealthKit(userId);
  }, intervalMinutes * 60 * 1000);
}