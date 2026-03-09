import { useEffect, useRef, useState } from "react";
import { Animated, Image, Platform, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;          // control from parent
  onHidden?: () => void;     // called after fade-out completes
  inDuration?: number;       // ms
  outDuration?: number;      // ms
};

export default function LoadingScreen({
  visible,
  onHidden,
  inDuration = 400,
  outDuration = 400,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.95)).current;
  const [mounted, setMounted] = useState(true);

  // fade + scale in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: inDuration, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  // fade + slight scale down on hide
  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: outDuration, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.98, duration: outDuration, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) {
          setMounted(false);
          onHidden?.();
        }
      });
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Animated.View style={[styles.root, { opacity, transform: [{ scale }] }]}>
      <View style={styles.row}>
        <Image
          source={require("../assets/maiArt/logo_border.png")}
          style={[
            styles.img,
            Platform.OS === "web" ? ({ imageRendering: "pixelated" } as any) : {},
          ]}
          resizeMode="contain"
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.text}>developed by</Text>
          <Text style={styles.text}>gooners</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  row: { flexDirection: "row", alignItems: "center" },
  img: { width: 150, height: 150 },
  text: { fontFamily: "PixelifySans_700", fontSize: 30, lineHeight: 30, color: "#623B2A" },
});
