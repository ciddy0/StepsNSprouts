// app/profile-settings.tsx
import { useAuth } from "@/context/AuthContext";
import {
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/userProfile";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const A = {
  bg: require("../assets/maiArt/backdrop.png"),
  panel: require("../assets/maiArt/panel_brown.png"),
  plaque: require("../assets/maiArt/button_long_brown.png"),
  close: require("../assets/maiArt/button_square.png"),

  pillBlue: (() => {
    return require("../assets/maiArt/button_blue.png");
  })(),
  pillGreen: (() => {
    return require("../assets/maiArt/button_green.png");
  })(),
  pillRed: (() => {
    return require("../assets/maiArt/button_red.png");
  })(),

  avatarRing: (() => {
    return require("../assets/maiArt/button_square.png");
  })(),
  sprout: (() => {
    try {
      return require("../assets/maiArt/sprout.png");
    } catch {
      return require("../assets/maiArt/profile.png");
    }
  })(),
  cam: (() => {
    return require("../assets/maiArt/camera.png");
  })(),
};

// Preset avatar options
const PRESET_AVATARS = [
  { id: 1, source: require("../assets/duck.png") },
  { id: 2, source: require("../assets/duck2.png") },
  { id: 3, source: require("../assets/no_image.jpg") },
  { id: 4, source: require("../assets/no_image.jpg") },
];

const BROWN = "#623B2A";

/* ================== tiny scale press ================== */
function PressableScale({ onPress, children, style }: any) {
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

function BlueInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "number-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <ImageBackground
      source={A.pillBlue}
      resizeMode="stretch"
      style={s.inputPill}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#f7f0d3"
        keyboardType={keyboardType ?? "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? "none"}
        style={s.inputText}
      />
    </ImageBackground>
  );
}

export const options = { headerShown: false };

export default function ProfileSettingsScreen() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Local state for profile data and loading/saving states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile fields
  const [stepGoal, setStepGoal] = useState<number | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [weight, setWeight] = useState<string>(""); // in lbs
  const [height, setHeight] = useState<string>(""); // in ft
  const [age, setAge] = useState<string>(""); // in years
  const [profilePicture, setProfilePicture] = useState<number>(1); // Avatar ID

  // Avatar picker modal state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Load user profile on mount or when user changes
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoadingProfile(true);

        await ensureUserProfile(user.uid, {
          email: user.email ?? undefined,
        });

        const profile = await getUserProfile(user.uid);
        if (profile) {
          setStepGoal(
            typeof profile.stepGoal === "number" ? profile.stepGoal : undefined
          );
          setFirstName(profile.firstName ?? "");
          setLastName(profile.lastName ?? "");
          setWeight(profile.weight?.toString() ?? "");
          setHeight(profile.height?.toString() ?? "");
          setAge(profile.age?.toString() ?? "");
          setProfilePicture(profile.profilePicture ?? 1);
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user]);

  // Handler for saving profile changes
  const onSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      const patch: Record<string, any> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        age: age ? Number(age) : undefined,
        stepGoal:
          typeof stepGoal === "number" && !Number.isNaN(stepGoal)
            ? stepGoal
            : undefined,
        profilePicture,
      };

      await updateUserProfile(user.uid, patch);
      Alert.alert("Success", "Your profile was updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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

  const handleSelectAvatar = (avatarId: number) => {
    setProfilePicture(avatarId);
    setShowAvatarPicker(false);
  };

  // Get current avatar source
  const currentAvatar = PRESET_AVATARS.find((a) => a.id === profilePicture)?.source || PRESET_AVATARS[0].source;

  // Render loading state
  if (loading) {
    return (
      <View style={s.centerLoading}>
        <ActivityIndicator size="large" />
        <Text style={s.loadingTxt}>Loading…</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (loadingProfile) {
    return (
      <View style={s.centerLoading}>
        <ActivityIndicator size="large" />
        <Text style={s.loadingTxt}>Loading your profile…</Text>
      </View>
    );
  }

  // Renders the profile settings form
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={A.bg}
        resizeMode="cover"
        style={s.bg}
      >
        <View style={s.container}>
          <View style={s.center}>
            {/* wood panel */}
            <ImageBackground
              source={A.panel}
              resizeMode="contain"
              style={s.panel}
            >
              {/* close w/ x */}
              <PressableScale style={s.closeWrap} onPress={handleClose}>
                <ImageBackground
                  source={A.close}
                  style={s.close}
                  resizeMode="contain"
                >
                  <Text style={s.closeX}>x</Text>
                </ImageBackground>
              </PressableScale>

              {/* title */}
              <ImageBackground
                source={A.plaque}
                style={s.titlePill}
                resizeMode="stretch"
              >
                <Text style={s.title}>profile</Text>
              </ImageBackground>

              <ScrollView
                contentContainerStyle={{
                  alignItems: "center",
                  paddingBottom: 18,
                }}
                showsVerticalScrollIndicator={false}
                style={{ width: "100%" }}
              >
                {/* avatar + camera */}
                <ImageBackground
                  source={A.avatarRing}
                  resizeMode="stretch"
                  style={s.avatarRing}
                >
                  <Image
                    source={currentAvatar}
                    style={s.avatar}
                    resizeMode="contain"
                  />
                  <PressableScale
                    style={s.camBtn}
                    onPress={() => setShowAvatarPicker(true)}
                  >
                    <Image
                      source={A.cam}
                      style={s.camIcon}
                      resizeMode="contain"
                    />
                  </PressableScale>
                </ImageBackground>

                {/* inputs */}
                <BlueInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="first name"
                  autoCapitalize="words"
                />
                <BlueInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="last name"
                  autoCapitalize="words"
                />
                <BlueInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="weight (lbs)"
                  keyboardType="number-pad"
                />
                <BlueInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder="height (inches)"
                  keyboardType="number-pad"
                />
                <BlueInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="age"
                  keyboardType="number-pad"
                />

                {/* goal */}
                <ImageBackground
                  source={A.pillBlue}
                  resizeMode="stretch"
                  style={s.inputPill}
                >
                  <TextInput
                    value={stepGoal?.toString() ?? ""}
                    onChangeText={(t) => {
                      const n = Number(t.replace(/[^\d]/g, ""));
                      setStepGoal(Number.isNaN(n) ? undefined : n);
                    }}
                    placeholder="daily step goal"
                    placeholderTextColor="#f7f0d3"
                    keyboardType="number-pad"
                    style={s.inputText}
                  />
                </ImageBackground>

                {/* buttons */}
                <View style={s.buttonRow}>
                  <PressableScale
                    onPress={onSave}
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    <ImageBackground
                      source={A.pillGreen}
                      resizeMode="stretch"
                      style={s.ctaPill}
                    >
                      <Text style={s.ctaText}>
                        {saving ? "saving…" : "save"}
                      </Text>
                    </ImageBackground>
                  </PressableScale>

                  <PressableScale onPress={handleSignOut}>
                    <ImageBackground
                      source={A.pillRed}
                      resizeMode="stretch"
                      style={s.ctaPill}
                    >
                      <Text style={s.ctaText}>sign out</Text>
                    </ImageBackground>
                  </PressableScale>
                </View>
              </ScrollView>
            </ImageBackground>
          </View>
        </View>

        {/* Avatar Picker Modal */}
        <Modal
          visible={showAvatarPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAvatarPicker(false)}
        >
          <Pressable
            style={s.modalOverlay}
            onPress={() => setShowAvatarPicker(false)}
          >
            <View style={s.modalContent}>
              <ImageBackground
                source={A.panel}
                resizeMode="contain"
                style={s.modalPanel}
              >
                <Text style={s.modalTitle}>choose avatar</Text>
                
                <View style={s.avatarGrid}>
                  {PRESET_AVATARS.map((avatar) => (
                    <PressableScale
                      key={avatar.id}
                      onPress={() => handleSelectAvatar(avatar.id)}
                    >
                      <ImageBackground
                        source={A.avatarRing}
                        resizeMode="stretch"
                        style={[
                          s.avatarOption,
                          profilePicture === avatar.id && s.avatarSelected,
                        ]}
                      >
                        <Image
                          source={avatar.source}
                          style={s.avatarOptionImg}
                          resizeMode="contain"
                        />
                      </ImageBackground>
                    </PressableScale>
                  ))}
                </View>

                <PressableScale onPress={() => setShowAvatarPicker(false)}>
                  <ImageBackground
                    source={A.pillRed}
                    resizeMode="stretch"
                    style={s.modalCloseBtn}
                  >
                    <Text style={s.ctaText}>close</Text>
                  </ImageBackground>
                </PressableScale>
              </ImageBackground>
            </View>
          </Pressable>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { width: "100%", maxWidth: 440, alignItems: "center" },
  panel: {
    width: 360,
    height: 680,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 18,
  },

  closeWrap: { position: "absolute", top: -8, right: -6, zIndex: 10 },
  close: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    fontFamily: "PixelifySans_700",
    fontSize: 26,
    color: BROWN,
    lineHeight: 26,
    textAlign: "center",
  },

  titlePill: {
    width: 220,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontFamily: "PixelifySans_700", fontSize: 26, color: BROWN },

  avatarRing: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  avatar: { width: 96, height: 96 },
  camBtn: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  camIcon: { width: 28, height: 28 },

  inputPill: {
    width: 280,
    height: 58,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  inputText: {
    width: "100%",
    textAlign: "center",
    fontFamily: "PixelifySans_700",
    fontSize: 20,
    color: "#ffffff",
  },

  buttonRow: {
    width: 300,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ctaPill: {
    width: 135,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontFamily: "PixelifySans_700", fontSize: 20, color: "#ffffff" },

  centerLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingTxt: { marginTop: 8, fontFamily: "PixelifySans_700", color: BROWN },

  // Modal styles
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
  modalTitle: {
    fontFamily: "PixelifySans_700",
    fontSize: 24,
    color: BROWN,
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  avatarOption: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSelected: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  avatarOptionImg: {
    width: 72,
    height: 72,
  },
  modalCloseBtn: {
    width: 135,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});