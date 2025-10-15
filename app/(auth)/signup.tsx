import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Image,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

export const options = { headerShown: false };

const A = {
  bg: require("../../assets/maiArt/backdrop.png"),
  panel: require("../../assets/maiArt/panel_brown.png"),
  yellowB: require("../../assets/maiArt/button_yellow.png"),
  longbutton: require("../../assets/maiArt/button_long_brown.png"),
    greylongbutton: require("../../assets/maiArt/button_grey.png"),
  close: require("../../assets/maiArt/button_square.png"),
  gLogo: require("../../assets/maiArt/google.png"),
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
        onPressIn={() => Animated.spring(s, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(s, { toValue: 1, useNativeDriver: true }).start()}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const pixelArtWebOnly =
    Platform.OS === "web" && width >= 768 ? ({ imageRendering: "pixelated" } as any) : undefined;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={A.bg}
        resizeMode="cover"
        style={styles.bg}
        imageStyle={pixelArtWebOnly}
      >
        <View style={styles.center}>
          {/* PANEL */}
          <ImageBackground
            source={A.panel}
            resizeMode="contain"
            style={styles.panel}
            imageStyle={pixelArtWebOnly}
          >
            <Image source={A.close} resizeMode="contain" style={styles.closeBadge} />

            {/* Title */}
            <ImageBackground
            source={A.longbutton}
            resizeMode="stretch"
            style={styles.titlePill}
            imageStyle={pixelArtWebOnly}
            >
            <Text style={styles.panelTitle}>signup</Text>
            </ImageBackground>

            {/* username */}
            <Text style={styles.fieldLabel}>username</Text>
            <ImageBackground
              source={A.longbutton}
              resizeMode="stretch"
              style={styles.inputWrap}
              imageStyle={pixelArtWebOnly}
            >
              <TextInput
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#623B2A"
                autoCapitalize="none"
              />
            </ImageBackground>

            {/* email */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>email</Text>
            <ImageBackground
              source={A.longbutton}
              resizeMode="stretch"
              style={styles.inputWrap}
              imageStyle={pixelArtWebOnly}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#623B2A"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </ImageBackground>

            {/* password */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>password</Text>
            <ImageBackground
              source={A.longbutton}
              resizeMode="stretch"
              style={styles.inputWrap}
              imageStyle={pixelArtWebOnly}
            >
              <TextInput
                value={pw}
                onChangeText={setPw}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#623B2A"
                secureTextEntry
                autoCapitalize="none"
              />
            </ImageBackground>

            {/* Google pill */}
            <Pressable style={{ width: "100%", marginTop: 10 }}>
              <ImageBackground
                source={A.greylongbutton}
                resizeMode="stretch"
                style={styles.googlePill}
                imageStyle={pixelArtWebOnly}
              >
                <Image source={A.gLogo} style={styles.gLogo} resizeMode="contain" />
                <Text style={styles.googleText}>via google</Text>
              </ImageBackground>
            </Pressable>
          </ImageBackground>

          {/* bottom CTA */}
          <View style={styles.bottomBtns}>
            <PressableScale onPress={() => {}}>
              <ImageBackground
                source={A.yellowB}
                resizeMode="contain"
                style={styles.button}
                imageStyle={pixelArtWebOnly}
              >
                <Text style={styles.btnText}>sign up</Text>
              </ImageBackground>
            </PressableScale>

            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.altLink}>already have an account? log in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%", height: "100%" },

  center: { width: "100%", maxWidth: 440, alignItems: "center" },

  panel: {
    width: 340,
    height: 600,
    alignItems: "center",
    paddingTop: 28,
    paddingHorizontal: 22,
  },
  closeBadge: { position: "absolute", top: -8, right: -6, width: 64, height: 64 },

  titlePill: {
  width: 220,
  height: 54,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 6,
},
panelTitle: {
  fontFamily: "PixelifySans_700",
  fontSize: 28,
  color: "#623B2A",
},

  fieldLabel: {
    width: "100%",
    fontFamily: "PixelifySans_700",
    fontSize: 18,
    color: "#623B2A",
    marginBottom: 4,
    textAlign: "center", 
    alignSelf: "center",
  },
  inputWrap: {
    width: "100%",
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    fontFamily: "PixelifySans_700",
    fontSize: 18,
    color: "#3B2A27",
  },

  googlePill: {
    width: "100%",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    columnGap: 10,
  },
  gLogo: { width: 22, height: 22, marginRight: 4 },
  googleText: { fontFamily: "PixelifySans_700", fontSize: 18, color: "#623B2A" },

  bottomBtns: { marginTop: 14, gap: 16, alignItems: "center" },
  button: { width: 220, height: 70, alignItems: "center", justifyContent: "center" },
  btnText: {
    fontFamily: "PixelifySans_700",
    fontSize: 22,
    color: "#623B2A",
    ...(Platform.OS === "web"
      ? { textShadow: "0px 1px 0px #F3D08C" }
      : {
          textShadowColor: "#F3D08C",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 0,
        }),
  },
  altLink: { fontFamily: "PixelifySans_700", fontSize: 16, color: "#623B2A", marginTop: 4 },
});
