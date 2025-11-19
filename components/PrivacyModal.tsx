


import { PRIVACY_TEXT } from "@/constants/privacy"; // 🔹 uses new constants file
import React, { useRef } from "react";
import {
    Animated,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const A = {
  panel: require("../assets/maiArt/panel_brown.png"),
  plaque: require("../assets/maiArt/button_long_brown.png"),
  pillYellow: require("../assets/maiArt/button_yellow.png"),
};

const BROWN = "#623B2A";

type PrivacyModalProps = {
  visible: boolean;
  onClose: () => void;
};

// simple press animation reused here so the modal looks like the rest of the UI
function PressableScale({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
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

export default function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <ImageBackground
            source={A.panel}
            resizeMode="contain"
            style={styles.modalPanel}
          >
            {/* title */}
            <ImageBackground
              source={A.plaque}
              style={styles.modalTitlePlate}
              resizeMode="stretch"
            >
              <Text style={styles.modalTitle}>privacy</Text>
            </ImageBackground>

            {/* body */}
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
            >
              <Text style={styles.modalText}>{PRIVACY_TEXT}</Text>
            </ScrollView>

            {/* close button */}
            <PressableScale style={styles.modalCloseBtn} onPress={onClose}>
              <ImageBackground
                source={A.pillYellow}
                style={styles.modalClosePill}
                resizeMode="stretch"
              >
                <Text style={styles.modalCloseText}>got it</Text>
              </ImageBackground>
            </PressableScale>
          </ImageBackground>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalPanel: {
    width: 340,
    height: 480,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalTitlePlate: {
    width: 220,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: BROWN,
  },
  modalBody: {
    flex: 1,
    width: "100%",
  },
  modalBodyContent: {
    paddingVertical: 8,
  },
  modalText: {
    fontFamily: "PixelifySans_400",
    fontSize: 16,
    color: BROWN,
    lineHeight: 22,
  },
  modalCloseBtn: {
    marginTop: 16,
    width: 180,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  modalClosePill: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontFamily: "PixelifySans_700",
    fontSize: 20,
    color: BROWN,
  },
});
