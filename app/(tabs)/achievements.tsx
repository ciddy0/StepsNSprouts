// app/(tabs)/achievements.tsx
import { useAuth } from "@/context/AuthContext";
import { useAchievements } from "@/hooks/useAchievements";
import { useCallback } from "react";
import { ActivityIndicator, Button, ScrollView, Text, View } from "react-native";

// -----------------------------------------------------------------------------
// Achievements screen (dev view)
// -----------------------------------------------------------------------------
export default function AchievementsScreen() {
  const { user } = useAuth(); // get current user
  const userId = user?.uid ?? null; // extract userId or null
  const { status, data, error, refresh } = useAchievements(userId); // use achievements hook

  // Header text based on state
  const header = (() => {
    if (!userId) return "Not signed in"; // no user
    if (status === "loading") return "Loading achievements…"; // loading state
    if (status === "error") return "Error loading achievements"; // error state
    return "User Achievements"; // ready state
  })();

  // Refresh handler
  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Render achievements
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{header}</Text>

      {!userId && <Text>Sign in to view achievements.</Text>}

      {status === "loading" && <ActivityIndicator />}

      {status === "error" && (
        <View>
          <Text>Something went wrong.</Text>
          <Text selectable>{String(error)}</Text>
          <View style={{ height: 8 }} />
          <Button title="Try refresh" onPress={onRefresh} />
        </View>
      )}

      {status === "ready" && (
        <View style={{ gap: 8 }}>
          <Text>Total: {data.length}</Text>
          <View style={{ height: 8 }} />
          <Button title="Manual refresh" onPress={onRefresh} />
          <View style={{ height: 12 }} />
          {data.length === 0 ? (
            <Text>No achievements yet.</Text>
          ) : (
            data.map((a) => (
              <View key={a.id + a.dateAcquired} style={{ paddingVertical: 6 }}>
                <Text>
                  • {a.title} [{a.tier}]
                </Text>
                <Text>  {a.description}</Text>
                <Text>  Earned: {a.dateAcquired}</Text>
                <Text>  Reward: {a.reward.pomes} pomes</Text>
                <Text>
                  {`  Requirement: ${a.requirement.type} = ${a.requirement.value}`}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}