// app/profile-settings.tsx

import { useAuth } from "@/context/AuthContext"; // provides user auth state
import {
  ensureUserProfile, // creates profile if missing
  getUserProfile, // fetches user profile
  updateUserProfile, // updates user profile
} from "@/services/firebase/userProfile";
import { Redirect } from "expo-router"; // for navigation
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileSettingsScreen() {
  const { user, loading } = useAuth(); // get current user and loading state

  // Local state for profile data and loading/saving states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  // Profile fields
  const [stepGoal, setStepGoal] = useState<number | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Additional state variables for weight, height, and age
  const [weight, setWeight] = useState<string>(""); // in lbs
  const [height, setHeight] = useState<string>(""); // in ft
  const [age, setAge] = useState<string>("");       // in years

  // Load user profile on mount or when user changes
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoadingProfile(true);
        // Ensure profile exists
        await ensureUserProfile(user.uid, {
          email: user.email ?? undefined,
        });
        // Fetch profile data
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setStepGoal(
            typeof profile.stepGoal === "number" ? profile.stepGoal : undefined
          );
          setFirstName(profile.firstName ?? "");
          setLastName(profile.lastName ?? "");
          // Load weight, height, and age
          setWeight(typeof profile.weight === "number" ? String(profile.weight) : "");
          setHeight(typeof profile.height === "number" ? String(profile.height) : "");
          setAge(typeof profile.age === "number" ? String(profile.age) : "");
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };
    // Call the load function
    load();
  }, [user]); // re-run if user changes

  // Handler for saving profile changes
  const onSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      // Prepare the patch object with updated fields
      const patch: Record<string, any> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        stepGoal:
          typeof stepGoal === "number" && !Number.isNaN(stepGoal) // only include if valid number
            ? stepGoal
            : undefined,
      };
      // Parse and validate weight, height, and age inputs
      const toNumberOrUndefined = (s: string, allowDecimal = false) => {
        const trimmed = s.trim(); // remove surrounding whitespace
        if (trimmed === "") return undefined;
        const clean = allowDecimal // allow decimal point for height
          ? trimmed.replace(/[^0-9.]/g, "")
          : trimmed.replace(/[^0-9]/g, "");
        const n = Number(clean); // convert to number
        return Number.isFinite(n) ? n : undefined; // return number or undefined
      };

      const weightNum = toNumberOrUndefined(weight); // weight in lbs
      const heightNum = toNumberOrUndefined(height, true); // height in ft (decimal allowed)
      const ageNum = toNumberOrUndefined(age); // age in years

      // Add to patch if valid numbers
      patch.weight = weightNum;
      patch.height = heightNum;
      patch.age = ageNum;

      // Update the user profile in Firestore
      await updateUserProfile(user.uid, patch);
      Alert.alert("Success", "Your profile was updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  // Render loading state
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }
  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/login" />;
  }
  // Render profile settings form
  if (loadingProfile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading your profile…</Text>
      </View>
    );
  }
  // Renders the profile settings form
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ gap: 16, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Profile Settings</Text>

        {/* First Name */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Last Name */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Daily Step Goal */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Daily Step Goal</Text>
          <TextInput
            value={stepGoal?.toString() ?? ""}
            keyboardType="number-pad"
            onChangeText={(t) => {
              const n = Number(t.replace(/[^\d]/g, ""));
              setStepGoal(Number.isNaN(n) ? undefined : n);
            }}
            placeholder="e.g. 10000"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Weight Input */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Weight (lbs)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="number-pad"
            placeholder="e.g. 150"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Height Input */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Height (ft)</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
            placeholder="e.g. 5.5"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Age Input */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Age (years)</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="e.g. 29"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save changes"}
          onPress={onSave}
          disabled={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
