// app/(tabs)/test.tsx
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  ensureHealthServiceInitialized,
  getTodaysProgress,
  getTodaysSteps,
} from "../../services/steps";

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
};

export default function StepsTestScreen() {
  const { width } = useWindowDimensions();
  const pixelArtWebOnly =
    Platform.OS === "web" && width >= 768 ? ({ imageRendering: "pixelated" } as any) : undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [progress, setProgress] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadStepData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const initialized = await ensureHealthServiceInitialized();
        setIsInitialized(initialized);

        if (initialized) {
          const todaySteps = await getTodaysSteps();
          setSteps(todaySteps);
          const progressData = await getTodaysProgress(10000);
          setProgress(progressData);
        } else {
          setError("Failed to initialize health service");
        }
      } catch (err: any) {
        setError(`Error: ${err?.message ?? String(err)}`);
        console.error("Steps test error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStepData();
  }, []);

  const pct = progress ? Math.max(0, Math.min(1, progress.progress)) : 0;
  
  function ProgressRing({ size = 140, strokeWidth = 12, progress = 0 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);
    return (
    <View style={s.ringWrap}>
      {/* pixel frame (grey pill asset) */}
      <ImageBackground
        source={A.ringFrame}
        resizeMode="stretch"
        style={[s.ringFrame, { width: size + 20, height: size + 20 }]}
      >
        <Svg width={size} height={size}>
          {/* base track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#d7d7d9"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* progress stroke */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ff2d55"
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
  return (
    <View style={s.screen}>
      <ImageBackground
        source={A.bg}
        resizeMode="cover"
        style={s.bg}
        imageStyle={pixelArtWebOnly}
      >
        <View style={s.center}>
          {/* panel */}
          <ImageBackground
            source={A.panel}
            resizeMode="contain"
            style={s.panel}
            imageStyle={pixelArtWebOnly}
          >
            <Image source={A.close} style={s.closeBadge} resizeMode="contain" />

            {/* title */}
            <ImageBackground
              source={A.longBrown}
              resizeMode="stretch"
              style={s.titlePill}
              imageStyle={pixelArtWebOnly}
            >
              <Text style={s.titleText}>health</Text>
            </ImageBackground>

            {/* bigger steps display */}
            <ImageBackground
              source={A.longBrown}
              resizeMode="stretch"
              style={[s.row, { marginTop: 10 }]}
              imageStyle={pixelArtWebOnly}
            >
              <Text style={s.rowLabel}>steps</Text>
              <Text style={s.rowValue}>{steps.toLocaleString()}</Text>
            </ImageBackground>

            {/* progress bar (grey bg) */}
            <View style={{ width: "100%", marginTop: 10 }}>
              <ImageBackground
                source={A.grey}
                resizeMode="stretch"
                style={s.progressWrap}
                imageStyle={pixelArtWebOnly}
              >
                <View style={[s.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
                <Text style={s.progressText}>{Math.round(pct * 100)}% of goal</Text>
              </ImageBackground>
            </View>

            {/* small stat rows */}
            <ImageBackground
              source={A.longBrown}
              resizeMode="stretch"
              style={s.row}
              imageStyle={pixelArtWebOnly}
            >
              <Text style={s.rowLabel}>goal</Text>
              <Text style={s.rowValue}>{progress?.goal?.toLocaleString?.() ?? "—"}</Text>
            </ImageBackground>

            <ImageBackground
              source={A.longBrown}
              resizeMode="stretch"
              style={s.row}
              imageStyle={pixelArtWebOnly}
            >
              <Text style={s.rowLabel}>remaining</Text>
              <Text style={s.rowValue}>
                {progress?.remaining?.toLocaleString?.() ?? "—"}
              </Text>
            </ImageBackground>




            {/* circle progress */}
            <ProgressRing progress={pct} />

            <ImageBackground
              source={A.longBrown}
              resizeMode="stretch"
              style={s.row}
              imageStyle={pixelArtWebOnly}
            >
              <Text style={s.rowLabel}>initialized</Text>
              <Text style={s.rowValue}>{isInitialized ? "yes" : "no"}</Text>
            </ImageBackground>

            {error ? (
              <Text style={[s.errorText, { marginTop: 8 }]}>{error}</Text>
            ) : null}
          </ImageBackground>
        </View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%", height: "100%" },

  center: { width: "100%", maxWidth: 440, alignItems: "center" },

  panel: {
    width: 360,
    height: 640,
    alignItems: "center",
    paddingTop: 26,
    paddingHorizontal: 20,
  },
  closeBadge: { position: "absolute", top: -10, right: -8, width: 64, height: 64 },

  titlePill: {
    width: 220,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  titleText: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: "#623B2A",
  },

  row: {
    width: "100%",
    height: 54,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 8,
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

  progressWrap: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 22,
    backgroundColor: "#ff2d55", 
    borderRadius: 6,
    marginRight: 8,
  },
  progressText: {
    textAlign: "center",
    fontFamily: "PixelifySans_700",
    fontSize: 16,
    color: "#623B2A",
  },

  errorText: {
    fontFamily: "PixelifySans_700",
    fontSize: 14,
    color: "#ff3b30",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  ringWrap: {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},
ringFrame: {
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 100,
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
