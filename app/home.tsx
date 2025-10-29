// app/home.tsx
import { AnimatedDuck } from "@/components/AnimatedDuck";
import { getTreeStageName } from "@/services/steps/treegrowth";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export const options = { headerShown: false };
const soundRef = useRef<Audio.Sound | null>(null);
const clickSoundRef = useRef<Audio.Sound | null>(null);

useEffect(() => {
  const playHomescreenMusic = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/music/lofi-background-music-326931.mp3"),
        { shouldPlay: true, isLooping: true, volume: 0.3 }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log("Error Loading Music", error);
    }
  };
  playHomescreenMusic();

  // Cleanup: stop music when component unmounts
  return () => {
    if (soundRef.current) {
      soundRef.current.stopAsync();
      soundRef.current.unloadAsync();
    }
  };
}, []);

const playClickSound = async () => {
  try {
    if (clickSoundRef.current) {
      await clickSoundRef.current.stopAsync();
      await clickSoundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require("../assets/music/menu-button-click.mp3"),
      { shouldPlay: true, volume: 0.8 }
    );
    clickSoundRef.current = sound;
  } catch (error) {
    console.log("Error playing click sound", error);
  }
};

function PressableScale({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(s, { toValue: 0.96, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(s, { toValue: 1, useNativeDriver: true }).start()
        }
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const pixelArtWebOnly =
    Platform.OS === "web" && width >= 768
      ? ({ imageRendering: "pixelated" } as any)
      : undefined;

  const handleLoginPress = async () => {
    await playClickSound();
    router.push("/(auth)/login");
  };

  const handleSignupPress = async () => {
    await playClickSound();
    router.push("/(auth)/signup");
  };

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require("../assets/maiArt/backdrop.png")}
        resizeMode="cover"
        style={styles.bg}
        imageStyle={pixelArtWebOnly}
      >
        <View style={styles.center}>
          <View style={styles.content}>
            {/* Title */}
            <Image
              source={require("../assets/maiArt/text_logo.png")}
              resizeMode="contain"
              style={styles.title}
            />

            {/* Duck */}
            <View style={styles.duckContainer}>
              <AnimatedDuck />
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <PressableScale onPress={handleLoginPress}>
                <ImageBackground
                  source={require("../assets/maiArt/button_yellow.png")}
                  resizeMode="contain"
                  style={styles.button}
                  imageStyle={pixelArtWebOnly}
                >
                  <Text style={styles.btnText}>log in</Text>
                </ImageBackground>
              </PressableScale>

              <PressableScale onPress={handleSignupPress}>
                <ImageBackground
                  source={require("../assets/maiArt/button_yellow.png")}
                  resizeMode="contain"
                  style={styles.button}
                  imageStyle={pixelArtWebOnly}
                >
                  <Text style={styles.btnText}>sign up</Text>
                </ImageBackground>
              </PressableScale>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  center: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
  },
  title: {
    width: 360,
    height: 160,
    marginBottom: 320,
  },
  duckContainer: {
    position: "absolute",
    top: "95%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -100 }],
    zIndex: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    gap: 16,
    width: "100%",
  },
  button: {
    width: 180,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: "#623B2A",
    ...(Platform.OS === "web"
      ? { textShadow: "0px 1px 0px #F3D08C" }
      : {
          textShadowColor: "#F3D08C",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 0,
        }),
  },
});
