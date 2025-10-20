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
import { getUserDocument, updateUserProfile } from "./userService";

/**
 * Get daily steps for a specific date
 */
export async function getDailySteps(
  userId: string, 
  date: string
): Promise<DailySteps | null> {
  const dailyStepsRef = doc(db, `users/${userId}/dailySteps`, date);
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
  
  const dailyStepsData: DailySteps = {
    id: date,
    userId,
    date,
    steps,
    lastSynced: new Date().toISOString()
  };
  
  await setDoc(dailyStepsRef, dailyStepsData);
  
  // Update user's total steps
  await updateTotalSteps(userId);
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
    
    // Save to Firestore
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
  
  // If we have cached data, use it; otherwise fetch fresh
  let steps: number;
  let lastSynced: string | null = null;
  
  if (todaySteps) {
    steps = todaySteps.steps;
    lastSynced = todaySteps.lastSynced;
  } else {
    // Fetch fresh from HealthKit
    const syncResult = await syncTodaysStepsFromHealthKit(userId);
    steps = syncResult.steps;
    // Fetch the newly created record to get lastSynced
    const newTodaySteps = await getDailySteps(userId, today);
    lastSynced = newTodaySteps?.lastSynced || null;
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
  
  const totalSteps = recentSteps.reduce((sum, day) => sum + day.steps, 0);
  const averageSteps = recentSteps.length > 0 ? Math.floor(totalSteps / recentSteps.length) : 0;
  
  return {
    totalSteps,
    averageSteps,
    daysWithData: recentSteps.length,
    dailyBreakdown: recentSteps
  };
}

/**
 * Check if user met their goal for a specific date
 */
export async function didMeetGoalOnDate(
  userId: string,
  date: string
): Promise<boolean> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const daySteps = await getDailySteps(userId, date);
  if (!daySteps) return false;
  
  return daySteps.steps >= user.stepGoal;
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
  
  const recentSteps = await getRecentDailySteps(userId, 365);
  
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate current streak (consecutive days meeting goal)
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const dayData = recentSteps.find(s => s.date.startsWith(dateStr));
    
    if (dayData && dayData.steps >= user.stepGoal) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Update longest streak if needed
  const longestStreak = Math.max(user.longestStreak, currentStreak);
  
  await updateUserProfile(userId, { 
    currentStreak, 
    longestStreak 
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
    totalSteps += doc.data().steps || 0;
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