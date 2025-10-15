import { useAuth } from '@/context/AuthContext';
import { isUsernameTaken } from '@/services/api/userService';
import { signInWithGoogleIdToken, useGoogleAuth } from '@/services/firebase/auth';
import { Audio } from 'expo-av';
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  disabled,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
}) {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, style]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => !disabled && Animated.spring(s, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => !disabled && Animated.spring(s, { toValue: 1, useNativeDriver: true }).start()}
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { signUp } = useAuth();
  const [request, response, promptAsync] = useGoogleAuth();

  // Play background music when component mounts
  useEffect(() => {
    const playBackgroundMusic = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/music/lofi-background-music-326931.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.3 }
        );
        soundRef.current = sound;
      } catch (error) {
        console.log('Error loading music:', error);
      }
    };

    playBackgroundMusic();

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setLoading(true);
    try {
      await signInWithGoogleIdToken(idToken);
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Google Sign-In Failed', 'Unable to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6){
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Checking username availability...');
      const taken = await isUsernameTaken(username);
      if (taken) {
        Alert.alert('Error', 'Username is already taken');
        setLoading(false);
        return;
      }
      
      console.log('Creating Firebase Auth account...');
      await signUp(email, password, username);
      
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      
      Alert.alert('Success', 'Account created successfully');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup';

      if (error.message === 'Username is already taken') {
        errorMessage = 'Username is already taken';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                editable={!loading}
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
                editable={!loading}
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
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#623B2A"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </ImageBackground>

            {/* confirm password */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>confirm</Text>
            <ImageBackground
              source={A.longbutton}
              resizeMode="stretch"
              style={styles.inputWrap}
              imageStyle={pixelArtWebOnly}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#623B2A"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </ImageBackground>

            {/* Google pill */}
            <Pressable 
              style={{ width: "100%", marginTop: 10 }}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
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
            <PressableScale onPress={handleSignup} disabled={loading}>
              <ImageBackground
                source={A.yellowB}
                resizeMode="contain"
                style={styles.button}
                imageStyle={pixelArtWebOnly}
              >
                {loading ? (
                  <ActivityIndicator color="#623B2A" />
                ) : (
                  <Text style={styles.btnText}>sign up</Text>
                )}
              </ImageBackground>
            </PressableScale>

            <Link href="/(auth)/login" asChild>
              <Pressable disabled={loading}>
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
    height: 660,
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