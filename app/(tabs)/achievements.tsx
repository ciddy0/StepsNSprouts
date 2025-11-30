// app/(tabs)/achievements.tsx
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { useAuth } from "@/context/AuthContext";
import { useAchievements } from "@/hooks/useAchievements";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AchievementsScreen() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { status, data: unlockedAchievements, error, refresh } = useAchievements(userId);

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <HamburgerMenu />
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!userId ? (
          <Text style={styles.message}>Sign in to view achievements.</Text>
        ) : status === "loading" ? (
          <ActivityIndicator size="large" color="#733E39" />
        ) : status === "error" ? (
          <Text style={styles.message}>Error loading achievements</Text>
        ) : (
          <View style={styles.list}>
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = unlockedAchievements.find(a => a.id === achievement.id);
              const isUnlocked = !!unlocked;

              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.card,
                    !isUnlocked && styles.cardLocked
                  ]}
                >
                  <View style={[styles.iconContainer, !isUnlocked && styles.iconLocked]}>
                    {/* Placeholder for icon */}
                    <View style={styles.iconPlaceholder} />
                  </View>

                  <View style={styles.info}>
                    <Text style={[styles.cardTitle, !isUnlocked && styles.textLocked]}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.cardDesc, !isUnlocked && styles.textLocked]}>
                      {achievement.description}
                    </Text>

                    <View style={styles.meta}>
                      <Text style={[styles.reward, !isUnlocked && styles.textLocked]}>
                        🏆 {achievement.reward.pomes} Pomes
                      </Text>
                      {isUnlocked && (
                        <Text style={styles.date}>
                          Earned: {new Date(unlocked.dateAcquired).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                  </View>

                  {isUnlocked && (
                    <View style={styles.checkMark}>
                      <Text style={{ fontSize: 20 }}>✅</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F0E9',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#EAD4AA',
    borderBottomWidth: 2,
    borderBottomColor: '#D4B896',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PixelifySans_700',
    fontSize: 32,
    color: '#733E39',
  },
  scrollContent: {
    padding: 20,
  },
  message: {
    fontFamily: 'PixelifySans_400',
    fontSize: 18,
    color: '#733E39',
    textAlign: 'center',
    marginTop: 40,
  },
  list: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4B896',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLocked: {
    backgroundColor: '#E0E0E0',
    borderColor: '#CCCCCC',
    opacity: 0.8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  iconLocked: {
    backgroundColor: '#CCCCCC',
    borderColor: '#AAAAAA',
  },
  iconPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'PixelifySans_700',
    fontSize: 18,
    color: '#5D4037',
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: 'PixelifySans_400',
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 8,
  },
  textLocked: {
    color: '#757575',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reward: {
    fontFamily: 'PixelifySans_700',
    fontSize: 14,
    color: '#FFA000',
  },
  date: {
    fontFamily: 'PixelifySans_400',
    fontSize: 12,
    color: '#8D6E63',
  },
  checkMark: {
    marginLeft: 10,
  },
});