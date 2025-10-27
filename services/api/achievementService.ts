
// -----------------------------------------------------------------------------
// Fetch + live subscribe to user's achievements from Firestore. Joins the
// stored user achievements (ids + dates) with our achievement definitions.
// -----------------------------------------------------------------------------

import { ACHIEVEMENTS, type Achievement } from "@/constants/achievements";
import { doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import type { UserAchievement } from "../firebase/collections/user";
import { db } from "../firebase/config";

/** What we return to the app: user-specific + definition data merged */
export type ResolvedAchievement = {
  id: string;                 // achievement id (from definition)
  title: string;
  description: string;
  icon: string;
  tier: Achievement["tier"];
  reward: Achievement["reward"];
  requirement: Achievement["requirement"];
  /** When the user earned this achievement (ISO string from Firestore) */
  dateAcquired: string;
};

/** Join helper */
function resolveUserAchievements(
  userAchievements: UserAchievement[] | undefined | null
): ResolvedAchievement[] {
  if (!userAchievements?.length) return [];
    // build a lookup map for efficiency
  const byId = new Map(ACHIEVEMENTS.map(a => [a.id, a])); // id => definition
  return userAchievements
    .map(ua => {
      const def = byId.get(ua.achievementId);
      if (!def) return null; // silently drop unknown ids
      return {
        // merge definition + user data
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        reward: def.reward,
        requirement: def.requirement,
        dateAcquired: ua.dateAcquired,
      } as ResolvedAchievement;
    })
    .filter((x): x is ResolvedAchievement => Boolean(x))
    // newest first
    .sort((a, b) => b.dateAcquired.localeCompare(a.dateAcquired));
}

/**
 * One-shot fetch of resolved achievements for a user.
 */
export async function getUserAchievementsResolved(
  userId: string
): Promise<ResolvedAchievement[]> {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() as { achievements?: UserAchievement[] };
  return resolveUserAchievements(data.achievements ?? []);
}

/**
 * Live subscription to a user's resolved achievements. Returns the unsubscribe.
 */
export function subscribeToUserAchievementsResolved(
  userId: string,
  onData: (achievements: ResolvedAchievement[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const ref = doc(db, "users", userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData([]);
        return;
      }
      const data = snap.data() as { achievements?: UserAchievement[] };
      onData(resolveUserAchievements(data.achievements ?? []));
    },
    (err) => {
      onError?.(err);
    }
  );
}
