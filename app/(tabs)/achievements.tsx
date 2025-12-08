// app/(tabs)/achievements.tsx
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { useAuth } from "@/context/AuthContext";
import { useAchievements } from "@/hooks/useAchievements";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export const options = { headerShown: false };

const A = {
  bg: require("../../assets/maiArt/backdrop.png"),
  panel: require("../../assets/maiArt/panel_brown.png"),
  longBrown: require("../../assets/maiArt/button_long_brown.png"),

};

const Icons = {
  badge: require("../../assets/maiArt/badge.png"),
  trophy: require("../../assets/maiArt/trophy.png"),
  check: require("../../assets/maiArt/check.png"),
};

export default function AchievementsScreen() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const { status, data: unlockedAchievements = [], error, refresh } = useAchievements(userId);

  const { width } = useWindowDimensions();
  const pixelArtWebOnly =
    Platform.OS === "web" && width >= 768
      ? ({ imageRendering: "pixelated" } as any)
      : undefined;

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const renderContent = () => {
    if (!userId) {
      return <Text style={styles.message}>Sign in to view achievements.</Text>;
    }

    if (status === "loading") {
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#623B2A" />
          <Text style={[styles.message, { marginTop: 10 }]}>Loading achievements...</Text>
        </View>
      );
    }

    if (status === "error") {
      return <Text style={styles.message}>Error loading achievements.</Text>;
    }

    return (
      <View style={styles.list}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedAchievements.find((a) => a.id === achievement.id);
          const isUnlocked = !!unlocked;

          return (
            <View
              key={achievement.id}
              style={[styles.card, !isUnlocked && styles.cardLocked]}
            >
              {/* Icon */}
              <ImageBackground
                source={Icons.badge}
                style={[styles.iconImage, !isUnlocked && styles.iconImageLocked]}
                resizeMode="contain"
              >
                {/* Optional inner highlight or nothing */}
              </ImageBackground>

              {/* Text content */}
              <View style={styles.info}>
                <Text style={[styles.cardTitle, !isUnlocked && styles.textLocked]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.cardDesc, !isUnlocked && styles.textLocked]}>
                  {achievement.description}
                </Text>

                <View style={styles.meta}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Image 
                      source={Icons.trophy}
                      style={{ width: 18, height: 18 }}
                      resizeMode="contain"
                    />
                    <Text style={[styles.reward, !isUnlocked && styles.textLocked]}>
                      {achievement.reward.pomes} Pomes
                    </Text>
                  </View>
                  {isUnlocked && (
                    <Text style={styles.date}>
                      Earned:{" "}
                      {new Date(unlocked.dateAcquired).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>

              {/* Checkmark */}
              {isUnlocked && (
                <Image
                  source={Icons.check}
                  style={{ width: 28, height: 28, marginLeft: 8 }}
                  resizeMode="contain"
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <HamburgerMenu />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ flexGrow: 1 }}
        // if you want pull-to-refresh, you can hook up RefreshControl here
        // refreshControl={
        //   <RefreshControl refreshing={status === "loading"} onRefresh={onRefresh} />
        // }
      >
        <ImageBackground
          source={A.bg}
          resizeMode="cover"
          style={styles.bg}
          imageStyle={pixelArtWebOnly}
        >
          <View style={styles.center}>
            <ImageBackground
              source={A.panel}
              resizeMode="contain"
              style={styles.panel}
              imageStyle={pixelArtWebOnly}
            >
              {/* Title */}
                <View style={styles.titleContainer}>
                  <ImageBackground
                    source={A.longBrown}
                    resizeMode="stretch"
                    style={styles.titlePill}
                    imageStyle={pixelArtWebOnly}
                  >
                    <Text style={styles.titleText}>achievements</Text>
                  </ImageBackground>
                </View>

              <View style={styles.contentContainer}>{renderContent()}</View>
            </ImageBackground>
          </View>
        </ImageBackground>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
    titleContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  titlePill: {
    width: 220,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: "#623B2A",
    textAlign: "center",
  },
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bg: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  panel: {
    width: 360,
    minHeight: 680,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  title: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: "#623B2A",
    textAlign: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  message: {
    fontFamily: "PixelifySans_400",
    fontSize: 16,
    color: "#623B2A",
    textAlign: "center",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 40,
    gap: 4,
  },
  list: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  card: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFE6B3", // same family as stats cards
    borderWidth: 4,
    borderColor: "#733E39",
    borderRadius: 6,
  },
  cardLocked: {
    backgroundColor: "#F6D7A3",
    borderColor: "#C68C55",
    opacity: 0.7,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#FFF4CF",
    borderWidth: 3,
    borderColor: "#F0C36A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconLocked: {
    backgroundColor: "#F3CFA1",
    borderColor: "#C1864D",
  },
  iconInner: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#FADFA2",
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "PixelifySans_700",
    fontSize: 16,
    color: "#623B2A",
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: "PixelifySans_400",
    fontSize: 13,
    color: "#3B2A27",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reward: {
    fontFamily: "PixelifySans_700",
    fontSize: 13,
    color: "#B45A1F",
  },
  date: {
    fontFamily: "PixelifySans_400",
    fontSize: 11,
    color: "#3B2A27",
  },
  textLocked: {
    color: "#8C5B33",
  },
  checkMark: {
    marginLeft: 8,
  },
  iconImage: {
  width: 52,
  height: 52,
  marginRight: 10,
},
iconImageLocked: {
  opacity: 0.45,
},
});
