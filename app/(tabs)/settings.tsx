import { HamburgerMenu } from "@/components/HamburgerMenu";
import PrivacyModal from "@/components/PrivacyModal";
import TermsModal from "@/components/TermsModal";
import { useAuth } from "@/context/AuthContext";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react"; // new
import {
  Alert,
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

const A = {
  bg: require("../../assets/maiArt/backdrop.png"),
  panel: require("../../assets/maiArt/panel_brown.png"),
  plaque: require("../../assets/maiArt/button_long_brown.png"),
  pillYellow: require("../../assets/maiArt/button_yellow.png"),
  pillRed: require("../../assets/maiArt/button_red.png"),
  close: require("../../assets/maiArt/button_square.png"),

  icoProfile: require("../../assets/maiArt/profile.png"),
  icoSecurity: require("../../assets/maiArt/security.png"),
  icoNotif: require("../../assets/maiArt/notifications.png"),
  icoPrivacy: require("../../assets/maiArt/privacy.png"),
  icoHelp: require("../../assets/maiArt/help_support.png"),
  icoTerms: require("../../assets/maiArt/terms.png"),
  icoReport: require("../../assets/maiArt/report.png"),
};

function PressableScale({ onPress, children, style }: any) {
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

function Row({ icon, text, isRed }: { icon: any; text: string; isRed?: boolean }) {
  return (
    <View style={styles.rowWrap}>
      <View style={styles.pillWrap}>
        <ImageBackground
          source={isRed ? A.pillRed : A.pillYellow}
          style={styles.pill}
          resizeMode="stretch"
        >
          <Image source={icon} style={styles.pillIcon} />
          <Text numberOfLines={1} style={styles.pillText}>{text}</Text>
        </ImageBackground>
      </View>
    </View>
  );
}

export default function Settings() {
  const { width } = useWindowDimensions();
  const { signOut } = useAuth();
  const router = useRouter();

  // new -------------------------------------------------
  const [showPrivacy, setShowPrivacyModal] = useState(false);
  const [showTerms, setShowTermsModal] = useState(false);

  const pixel =
    Platform.OS === "web" && width >= 768
      ? ({ imageRendering: "pixelated" } as any)
      : undefined;

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    router.back();
  };

  const handleOpenPrivacy = () => {
    setShowPrivacyModal(true);
  }

  const handleClosePrivacy = () => {
    setShowPrivacyModal(false);
  }

  const handleOpenTerms = () => {
    setShowTermsModal(true);
  }

  const handleCloseTerms = () => {
    setShowTermsModal(false);
  }


  return (
    <View style={styles.screen}>
      <HamburgerMenu />
      <ImageBackground source={A.bg} style={styles.bg} resizeMode="cover" imageStyle={pixel}>
        <View style={styles.center}>
          <ImageBackground source={A.panel} style={styles.panel} resizeMode="contain" imageStyle={pixel}>
            {/* close button with x */}
            <PressableScale style={{ position: "absolute", top: -8, right: -6 }} onPress={handleClose}>
              <ImageBackground source={A.close} style={{ width: 58, height: 58, alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.closeX}>x</Text>
              </ImageBackground>
            </PressableScale>

            {/* title */}
            <ImageBackground source={A.plaque} style={styles.titlePlate} resizeMode="stretch" imageStyle={pixel}>
              <Text style={styles.title}>settings</Text>
            </ImageBackground>

            {/* rows */}
            <Link href="/profile-settings" asChild>
              <PressableScale><Row icon={A.icoProfile} text="edit profile" /></PressableScale>
            </Link>

            <PressableScale onPress={handleOpenPrivacy}>
              <Row icon={A.icoPrivacy} text="privacy" />
            </PressableScale>

            <PressableScale onPress={handleOpenTerms}>
              <Row icon={A.icoTerms} text="terms & conditions" />
            </PressableScale>

            {/* sign out button inside panel */}
            <PressableScale onPress={handleSignOut}>
              <Row icon={A.icoProfile} text="sign out" isRed />
            </PressableScale>
          </ImageBackground>
        </View>
      </ImageBackground>
      <PrivacyModal visible={showPrivacy} onClose={handleClosePrivacy} />
      <TermsModal visible={showTerms} onClose={handleCloseTerms} />
    </View>
  );
}

const BROWN = "#623B2A";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  bg: {
    flex: 1, width: "100%", height: "100%", alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, width: "100%", maxWidth: 440, alignItems: "center", justifyContent: "center", },
  closeX: {
    fontFamily: "PixelifySans_700",
    fontSize: 26,
    color: BROWN,
    lineHeight: 26,
    textAlign: "center",
  },
  panel: {
    width: 360,
    height: 680,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 18,
  },

  titlePlate: {
    width: 260,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: { fontFamily: "PixelifySans_700", fontSize: 28, color: BROWN },

  rowWrap: {
    width: "100%",
    height: 72,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  pillWrap: {
    marginLeft: 4,
    height: 72,
    justifyContent: "center",
  },

  pill: {
    width: 240,
    height: 56,
    paddingHorizontal: 18,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  pillIcon: {
    width: 22,
    height: 22,
    tintColor: BROWN,
    marginRight: 12,
  },
  pillText: { fontFamily: "PixelifySans_700", fontSize: 20, color: BROWN },
});