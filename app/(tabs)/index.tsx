import itemMap from "@/constants/inventoryItems";
import { useAuth } from "@/context/AuthContext";
import {
  getTodaysStepsWithProgress,
  syncTodaysStepsFromHealthKit,
} from "@/services/api/dailyStepsService";
import { getUserDocument } from "@/services/api/userService";
import { User } from "@/services/firebase/collections/user";
import { ensureHealthServiceInitialized } from "@/services/steps";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Steps state
  const [stepsData, setStepsData] = useState({
    steps: 0,
    goal: 10000,
    progress: 0,
    goalMet: false,
    remaining: 0,
    lastSynced: null as string | null,
  });
  const [stepsLoading, setStepsLoading] = useState(true);

  // Auto-sync interval reference
  const syncIntervalRef = useRef<number | null>(null);

  const treeImageMap: { [key: number]: any } = {
    0: require("../../assets/maiArt/tree0/tree_stage_0.png"),
    1: require("../../assets/maiArt/tree0/tree_stage_1.png"),
    2: require("../../assets/maiArt/tree0/tree_stage_2.png"),
    3: require("../../assets/maiArt/tree0/tree_stage_3.png"),
    4: require("../../assets/maiArt/tree0/tree_stage_4.png"),
    5: require("../../assets/maiArt/tree0/tree_stage_5.png"),
    6: require("../../assets/maiArt/tree0/tree_stage_6.png"),
  };

  const PRESET_AVATARS: { id: number; source: any }[] = [
    { id: 1, source: require("../../assets/duck.png") },
    { id: 2, source: require("../../assets/duck2.png") },
    { id: 3, source: require("../../assets/flowerPic.png") },
    { id: 4, source: require("../../assets/sprout_profile.png") },
  ];

  // DELETE THIS LATER JUST FOR DEMO HEHE HAHA
  const [growthLevel, setGrowthLevel] = useState(0);

  // Initialize HealthKit on mount
  useEffect(() => {
    const initHealthKit = async () => {
      try {
        const initialized = await ensureHealthServiceInitialized();
        if (!initialized) {
          Alert.alert(
            "Health Data Unavailable",
            "Could not initialize health data service. Step tracking may not work properly."
          );
        }
      } catch (error) {
        console.error("Error initializing HealthKit:", error);
      }
    };

    initHealthKit();
  }, []);

  // Fetch steps data
  const fetchStepsData = async () => {
    if (!user) return;

    try {
      setStepsLoading(true);
      const data = await getTodaysStepsWithProgress(user.uid);
      setStepsData(data);
    } catch (error) {
      console.error("Error fetching steps data:", error);
      Alert.alert("Error", "Failed to load step data");
    } finally {
      setStepsLoading(false);
    }
  };

  // Setup auto-sync when user is available
  useEffect(() => {
    if (user) {
      // Initial sync on mount
      const doInitialSync = async () => {
        try {
          console.log("[HomeScreen] Performing initial sync...");
          await syncTodaysStepsFromHealthKit(user.uid);
          // Fetch data after initial sync
          await fetchStepsData();
          // Fetch user data to get tree level
          const updatedUserData = await getUserDocument(user.uid);
          setUserData(updatedUserData);
        } catch (err) {
          console.error("Initial sync failed:", err);
        }
      };

      doInitialSync();

      // Setup auto-sync every 15 minutes
      const intervalId = setInterval(
        async () => {
          try {
            console.log("[HomeScreen] Auto-syncing steps...");
            // Sync to Firebase
            await syncTodaysStepsFromHealthKit(user.uid);
            // Fetch updated data to refresh UI
            await fetchStepsData();
            // Also refresh user data to get updated tree level
            const updatedUserData = await getUserDocument(user.uid);
            setUserData(updatedUserData);
          } catch (err) {
            console.error("Auto-sync failed:", err);
          }
        },
        15 * 60 * 1000
      ); // 15 minutes

      syncIntervalRef.current = intervalId;
    }

    // Cleanup on unmount
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserDocument(user.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const getAvatarSource = (avatarId: number) => {
    const avatar = PRESET_AVATARS.find((a) => a.id === avatarId);
    return avatar ? avatar.source : require("../../assets/no_image.jpg");
  };

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refetchOnFocus = async () => {
        if (user) {
          try {
            // Only fetch cached data, don't sync
            // Syncing is handled by the auto-sync interval
            const data = await getUserDocument(user.uid);
            setUserData(data);

            // Refresh steps from cache
            await fetchStepsData();
          } catch (error) {
            console.error("Error fetching data on focus:", error);
          }
        }
      };

      refetchOnFocus();
    }, [user])
  );

  // Pull to refresh
  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      // Force sync steps from HealthKit
      await syncTodaysStepsFromHealthKit(user.uid);

      // Refresh all data
      const [userDataResult, stepsDataResult] = await Promise.all([
        getUserDocument(user.uid),
        getTodaysStepsWithProgress(user.uid),
      ]);

      setUserData(userDataResult);
      setStepsData(stepsDataResult);
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear auto-sync interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }

      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Welcome to Steps n Sprouts
      </Text>

      {/* Steps Progress Section */}
      <View
        style={{
          backgroundColor: "#f0f0f0",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Today's Steps
        </Text>

        {stepsLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{ fontSize: 32, fontWeight: "bold", color: "#4CAF50" }}
              >
                {stepsData.steps.toLocaleString()}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Goal: {stepsData.goal.toLocaleString()} steps
              </Text>
            </View>

            {/* Progress Bar */}
            <View
              style={{
                height: 10,
                backgroundColor: "#ddd",
                borderRadius: 5,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${stepsData.progress * 100}%`,
                  backgroundColor: stepsData.goalMet ? "#4CAF50" : "#2196F3",
                }}
              />
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 12, color: "#666" }}>
                {Math.round(stepsData.progress * 100)}% complete
              </Text>
              {!stepsData.goalMet && (
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {stepsData.remaining} steps to go!
                </Text>
              )}
              {stepsData.goalMet && (
                <Text
                  style={{ fontSize: 12, color: "#4CAF50", fontWeight: "bold" }}
                >
                  🎉 Goal achieved!
                </Text>
              )}
            </View>

            {stepsData.lastSynced && (
              <Text style={{ fontSize: 10, color: "#999", marginTop: 8 }}>
                Last synced:{" "}
                {new Date(stepsData.lastSynced).toLocaleTimeString()}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Firebase Auth Info */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          Firebase Auth Info:
        </Text>
        <Text>Email: {user?.email}</Text>
        <Text>User ID: {user?.uid}</Text>
        <Text>Email Verified: {user?.emailVerified ? "Yes" : "No"}</Text>
      </View>

      {/* Firestore User Data */}
      {userData && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
            Firestore User Data:
          </Text>
          <Text>Username: {userData.username}</Text>
          <Text>First Name: {userData.firstName || "Not set"}</Text>
          <Text>Last Name: {userData.lastName || "Not set"}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Step Goal: {userData.stepGoal}</Text>
          <Text>Pomes Currency: {userData.pomes}</Text>
          <Text>
            Total Steps (All Time): {userData.totalSteps.toLocaleString()}
          </Text>
          <Text>Current Streak: {userData.currentStreak} days 🔥</Text>
          <Text>Longest Streak: {userData.longestStreak} days</Text>
          <Image
            source={getAvatarSource(userData.profilePicture)}
            style={{ width: 100, height: 100, borderRadius: 50 }}
            resizeMode="contain"
          />
          <Text>Profile Picture: {userData.profilePicture || "Not set"}</Text>
          <Text>Tree level: {userData.garden.tree.growthLevel}</Text>
          <Text>
            Tree total steps: {userData.garden.tree.totalStepsContributed}
          </Text>

          {/* Display tree based on user's actual growth level */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Image
              source={
                treeImageMap[userData.garden.tree.growthLevel] ||
                treeImageMap[0]
              }
              style={{ width: 200, height: 200, marginVertical: 10 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 14, color: "#666", marginTop: 5 }}>
              Level {userData.garden.tree.growthLevel} / 6
            </Text>
            <Text style={{ fontSize: 12, color: "#999" }}>
              {userData.garden.tree.totalStepsContributed.toLocaleString()}{" "}
              steps contributed
            </Text>
            <Text style={{ fontSize: 12, color: "#999" }}>
              Next level:{" "}
              {(
                (userData.garden.tree.growthLevel + 1) *
                10000
              ).toLocaleString()}{" "}
              steps
            </Text>
          </View>

          {/* Demo section - DELETE THIS LATER */}
          <View
            style={{
              marginTop: 30,
              padding: 15,
              backgroundColor: "#fff3cd",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                marginBottom: 8,
                color: "#856404",
              }}
            >
              🎨 Demo Tree Preview (DELETE LATER)
            </Text>
            <TextInput
              keyboardType="numeric"
              value={String(growthLevel)}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (num >= 6) setGrowthLevel(6);
                else if (num <= 0) setGrowthLevel(0);
                else setGrowthLevel(num);
              }}
              placeholder="Tree Growth Level"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 8,
                borderRadius: 4,
                marginTop: 8,
                marginBottom: 8,
                backgroundColor: "white",
              }}
            />
            <Image
              source={treeImageMap[growthLevel]}
              style={{
                width: 150,
                height: 150,
                marginVertical: 10,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          </View>
          <Text>Inventory: </Text>
          <View style={{ display: "flex", gap: 20, flexDirection: "row" }}>
            {userData.inventory.map((item) => {
              return (
                <Image
                  source={itemMap[item.decorationId]}
                  style={{
                    width: 50,
                    height: 50,
                    marginVertical: 10,
                    alignSelf: "left",
                  }}
                  resizeMode="contain"
                  key={item.decorationId}
                />
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/profile-settings")}
            style={{
              marginTop: 12,
              padding: 10,
              backgroundColor: "#2196F3",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!userData && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: "red" }}>No Firestore user data found</Text>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        disabled={loading}
        style={{
          padding: 15,
          backgroundColor: loading ? "#ccc" : "#f44336",
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Log Out
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
