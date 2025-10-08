// app/profile-settings.tsx
import { useAuth } from "@/context/AuthContext";
import {
    ensureUserProfile,
    getUserProfile,
    updateUserProfile,
} from "@/services/firebase/userProfile";
import { Redirect } from "expo-router";
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
  const { user, loading } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stepGoal, setStepGoal] = useState<number | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    try {
      setSaving(true);

      const patch: Record<string, any> = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        stepGoal:
          typeof stepGoal === "number" && !Number.isNaN(stepGoal)
            ? stepGoal
            : undefined,
      };

      await updateUserProfile(user.uid, patch);
      Alert.alert("Success", "Your profile was updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (loadingProfile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading your profile…</Text>
      </View>
    );
  }

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

        <Button
          title={saving ? "Saving…" : "Save changes"}
          onPress={onSave}
          disabled={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
