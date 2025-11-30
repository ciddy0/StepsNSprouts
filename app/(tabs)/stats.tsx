// app/(tabs)/test.tsx - Stats Tab
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { HamburgerMenu } from "@/components/HamburgerMenu";
import Svg, { Circle } from "react-native-svg";

export const options = { headerShown: false };

const A = {
  bg: require("../../assets/maiArt/backdrop.png"),
  panel: require("../../assets/maiArt/panel_brown.png"),
  longBrown: require("../../assets/maiArt/button_long_brown.png"),
  yellow: require("../../assets/maiArt/button_yellow.png"),
  grey: require("../../assets/maiArt/button_grey.png"),
  close: require("../../assets/maiArt/button_square.png"),
  ringFrame: require("../../assets/maiArt/button_grey.png"),
  fire: require("../../assets/maiArt/fire.png"),
};

export default function StatsScreen() {
  const { user } = useAuth();
  const { userData, stepsData, isLoading, fetchData } = useUserData();
  const { width } = useWindowDimensions();
  const pixelArtWebOnly =
    Platform.OS === "web" && width >= 768 ? ({ imageRendering: "pixelated" } as any) : undefined;

  const [refreshing, setRefreshing] = useState(false);

  // Fetch data when screen loads (will use cache if fresh)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchData(user.uid);
      }
    }, [user, fetchData])
  );

  // Pull to refresh - force refresh
  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    await fetchData(user.uid, true); // Force refresh
    setRefreshing(false);
  };

  const pct = Math.max(0, Math.min(1, stepsData.progress));

  function ProgressRing({ size = 140, strokeWidth = 12, progress = 0 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);
    return (
      <View style={s.ringWrap}>
        <ImageBackground
          source={A.ringFrame}
          resizeMode="stretch"
          style={[s.ringFrame, { width: size + 20, height: size + 20 }]}
          imageStyle={pixelArtWebOnly}
        >
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#d7d7d9"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FF746C"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={s.ringCenter}>
            <Text style={s.ringValue}>{Math.round(progress * 100)}%</Text>
            <Text style={s.ringCaption}>of goal</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#623B2A" />
        <Text style={{ marginTop: 10, fontFamily: "PixelifySans_700" }}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <>
      <HamburgerMenu />
      <ScrollView
        style={s.screen}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ImageBackground
          source={A.bg}
          resizeMode="cover"
          style={s.bg}
          imageStyle={pixelArtWebOnly}
        >
          <View style={s.center}>
            <ImageBackground
              source={A.panel}
              resizeMode="contain"
              style={s.panel}
              imageStyle={pixelArtWebOnly}
            >
              <Image source={A.close} style={s.closeBadge} resizeMode="contain" />

              {/* Title */}
              <View style={s.titleContainer}>
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.titlePill}
                  imageStyle={pixelArtWebOnly}
                >
                  <Text style={s.titleText}>stats</Text>
                </ImageBackground>
              </View>

              {/* Content Container */}
              <View style={s.contentContainer}>
                {/* Today's Steps */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <Text style={s.rowLabel}>today</Text>
                    <Text style={s.rowValue}>{stepsData.steps.toLocaleString()}</Text>
                  </View>
                </ImageBackground>

                {/* Goal */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <Text style={s.rowLabel}>goal</Text>
                    <Text style={s.rowValue}>{stepsData.goal.toLocaleString()}</Text>
                  </View>
                </ImageBackground>

                {/* Remaining */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <Text style={s.rowLabel}>remaining</Text>
                    <Text style={s.rowValue}>
                      {stepsData.remaining.toLocaleString()}
                    </Text>
                  </View>
                </ImageBackground>

                {/* Current Streak */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={s.rowLabel}>streak</Text>
                      <Image
                        source={A.fire}
                        style={{ width: 18, height: 18 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={s.rowValue}>{userData?.currentStreak || 0} days</Text>
                  </View>
                </ImageBackground>

                {/* Longest Streak */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <Text style={s.rowLabel}>best streak</Text>
                    <Text style={s.rowValue}>{userData?.longestStreak || 0} days</Text>
                  </View>
                </ImageBackground>

                {/* Total Steps */}
                <ImageBackground
                  source={A.longBrown}
                  resizeMode="stretch"
                  style={s.row}
                  imageStyle={pixelArtWebOnly}
                >
                  <View style={s.rowContent}>
                    <Text style={s.rowLabel}>total steps</Text>
                    <Text style={s.rowValue}>{userData?.totalSteps.toLocaleString() || "0"}</Text>
                  </View>
                </ImageBackground>

                {/* Progress Ring */}
                <ProgressRing progress={pct} />
              </View>
            </ImageBackground>
          </View>
        </ImageBackground>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff"
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
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  closeBadge: {
    position: "absolute",
    top: -10,
    right: -8,
    width: 64,
    height: 64
  },
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
  contentContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  row: {
    width: "100%",
    height: 54,
  },
  rowContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    fontFamily: "PixelifySans_700",
    fontSize: 18,
    color: "#623B2A",
  },
  rowValue: {
    fontFamily: "PixelifySans_700",
    fontSize: 20,
    color: "#3B2A27",
  },
  errorText: {
    fontFamily: "PixelifySans_700",
    fontSize: 14,
    color: "#ff3b30",
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  ringFrame: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    fontFamily: "PixelifySans_700",
    fontSize: 22,
    color: "#623B2A",
  },
  ringCaption: {
    fontFamily: "PixelifySans_700",
    fontSize: 14,
    color: "#3B2A27",
    marginTop: -2,
  },
});