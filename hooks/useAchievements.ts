
import { getUserAchievementsResolved, subscribeToUserAchievementsResolved, type ResolvedAchievement } from "@/services/api/achievementService";
import { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// React hook for live subscription to a user's resolved achievements.
// -----------------------------------------------------------------------------
type Status = "idle" | "loading" | "ready" | "error";
export function useAchievements(userId: string | null | undefined) {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<ResolvedAchievement[]>([]);
  const [error, setError] = useState<unknown>(null);

  // live subscription
  useEffect(() => {
    if (!userId) {
      setData([]);
      setStatus("idle");
      return;
    }
    // start subscription
    setStatus("loading");
    const unsub = subscribeToUserAchievementsResolved(
      userId,
      // data handler
      (ach) => {
        setData(ach);
        setStatus("ready");
      },
      // error handler
      (err) => {
        setError(err);
        setStatus("error");
      }
    );
    return () => unsub();
  }, [userId]); // re-subscribe if userId changes

  // optional manual refresh (one-shot)
  // call this function to refresh the achievements outside of the subscription
  const refresh = async () => {
    if (!userId) return;
    try {
      setStatus("loading"); // indicate loading
      const ach = await getUserAchievementsResolved(userId); // fetch data
      setData(ach); // update state
      setStatus("ready"); // set ready
    } catch (e) {
      setError(e);
      setStatus("error"); // set error
    }
  };
  // return hook state
  return { status, data, error, refresh };
}
