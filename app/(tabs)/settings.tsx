import { Link } from "expo-router";
import { useRef } from "react";
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

const A = {
  bg: require("../../assets/maiArt/backdrop.png"),
  panel: require("../../assets/maiArt/panel_brown.png"),
  plaque: require("../../assets/maiArt/button_long_brown.png"),
  pillYellow: require("../../assets/maiArt/button_yellow.png"),
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

function Row({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.rowWrap}>
      {/* pill stack */}
      <View style={styles.pillWrap}>
        {/* front pill (yellow) with text inside */}
         <ImageBackground source={A.pillYellow} style={styles.pill} resizeMode="stretch">
          <Image source={icon} style={styles.pillIcon} />
          <Text numberOfLines={1} style={styles.pillText}>{text}</Text>
        </ImageBackground>
      </View>
    </View>
  );
}


export default function Settings() {
  const { width } = useWindowDimensions();
  const pixel =
    Platform.OS === "web" && width >= 768
      ? ({ imageRendering: "pixelated" } as any)
      : undefined;

  return (
    <View style={styles.screen}>
      <ImageBackground source={A.bg} style={styles.bg} resizeMode="cover" imageStyle={pixel}>
        <View style={styles.center}>
          <ImageBackground source={A.panel} style={styles.panel} resizeMode="contain" imageStyle={pixel}>
            {/* close button with x */}
            <PressableScale style={{ position: "absolute", top: -8, right: -6 }} onPress={() => {}}>
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
            <PressableScale><Row icon={A.icoSecurity} text="security" /></PressableScale>
            <PressableScale><Row icon={A.icoNotif} text="notifications" /></PressableScale>
            <PressableScale><Row icon={A.icoPrivacy} text="privacy" /></PressableScale>
            <PressableScale><Row icon={A.icoHelp} text="help & support" /></PressableScale>
            <PressableScale><Row icon={A.icoTerms} text="terms & conditions" /></PressableScale>
            <PressableScale><Row icon={A.icoReport} text="report" /></PressableScale>
          </ImageBackground>

          {/* sign out */}
          <PressableScale onPress={() => {}}>
            <ImageBackground source={A.pillYellow} style={styles.signOut} resizeMode="stretch" imageStyle={pixel}>
              <Text style={styles.signOutText}>sign out</Text>
            </ImageBackground>
          </PressableScale>
        </View>
      </ImageBackground>
    </View>
  );
}

const BROWN = "#623B2A";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  bg: { flex: 1, width: "100%", height: "100%" },
  center: { width: "100%", maxWidth: 440, alignItems: "center" },
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

  
  closeWrap: { position: "absolute", top: -8, right: -6 },
  close: { width: 58, height: 58, alignItems: "center", justifyContent: "center" },

  rowWrap: {
    width: "100%",
    height: 72,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconCol: { width: 44, alignItems: "center", justifyContent: "center" },
  icon: { width: 22, height: 22},

  
  pillBack: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 268,  
    height: 64,
  },
  pillStack: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  pillWrap: {
    marginLeft: 4,
    height: 72,
    justifyContent: "center",
  },
 
  pillHalo: {
    position: "absolute",
    left: 6,
    width: "78%",        
    height: 66,
  },
  
  pill: {
    width: 240,   
    height: 56,
    marginLeft: 14,
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
  rowText: { fontFamily: "PixelifySans_700", fontSize: 20, color: BROWN },
  pillText: { fontFamily: "PixelifySans_700", fontSize: 20, color: BROWN },

  signOut: { width: 230, height: 72, marginTop: 14, alignItems: "center", justifyContent: "center" },
  signOutText: { fontFamily: "PixelifySans_700", fontSize: 22, color: BROWN },
});
