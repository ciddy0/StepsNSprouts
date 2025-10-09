// app/home.tsx
import { useRouter } from "expo-router";
import React, { useRef } from "react";

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
        onPressIn={() => Animated.spring(s, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(s, { toValue: 1, useNativeDriver: true }).start()}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const pixelArtWebOnly = Platform.OS === "web" && width >= 768 ? ({ imageRendering: "pixelated" } as any) : undefined;

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

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <PressableScale onPress={() => router.push("/(auth)/login")}>
                <ImageBackground
                  source={require("../assets/maiArt/button_yellow.png")}
                  resizeMode="contain"
                  style={styles.button}
                  imageStyle={pixelArtWebOnly} 
                >
                  <Text style={styles.btnText}>log in</Text>
                </ImageBackground>
              </PressableScale>

              <PressableScale onPress={() => router.push("/(auth)/signup")} style={{ marginLeft: 16 }}>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 440, 
    alignItems: "center",
  },
  title: {
    width: 360,   // adjust to asset
    height: 160,  // adjust to asset
    marginBottom: 320,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  button: {
    width: 180,   // button
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
