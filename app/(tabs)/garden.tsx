import { HamburgerMenu } from "@/components/HamburgerMenu";
import itemMap from "@/constants/inventoryItems";
import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { syncTodaysStepsFromHealthKit } from "@/services/api/dailyStepsService";
import {
  getUserDocument,
  placeDecorationInGarden,
  removeDecorationFromGarden,
} from "@/services/api/userService";
import { ensureHealthServiceInitialized } from "@/services/steps";
import { ALL_DECORATION_SLOTS } from "@/utils/slotHelpers";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
type InventoryItem = {
  decorationId: string;
  instances: {
    instanceId: string;
    name: string | null;
    dateAcquired: string;
  }[];
};

type PlacedDecoration = {
  instanceId: string;
  x: number;
  y: number;
  dateAdded: string;
};

export default function GardenScreen() {
  const { user } = useAuth();
  const { userData, stepsData, fetchData } = useUserData();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [placedDecorations, setPlacedDecorations] = useState<
    PlacedDecoration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showTreeInfo, setShowTreeInfo] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Auto-sync interval reference
  const syncIntervalRef = useRef<number | null>(null);

  // old code with 2 slots
  // Preset locations for decorations (left and right of tree)
  //const decorationSlots = [
  //  { x: 0, y: 0, position: 'left' },   // Left slot
  //  { x: 1, y: 0, position: 'right' },  // Right slot
  // ];

  // NEW CODE - 5 SLOTS
  const decorationSlots = ALL_DECORATION_SLOTS;

  // Fetch garden-specific data (inventory and decorations)
  const fetchGardenData = async () => {
    try {
      if (user) {
        const userDoc = await getUserDocument(user.uid);
        if (userDoc) {
          setInventory(userDoc.inventory || []);
          setPlacedDecorations(userDoc.garden?.decorations || []);

          // Debug logging
          console.log("User inventory:", userDoc.inventory);
          console.log("Placed decorations:", userDoc.garden?.decorations);
        }
      }
    } catch (error) {
      console.error("Error fetching garden data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Setup auto-sync when user is available
  useEffect(() => {
    if (user) {
      // Initial sync and fetch cached data
      const doInitialSync = async () => {
        try {
          console.log("[GardenScreen] Performing initial sync...");
          await syncTodaysStepsFromHealthKit(user.uid);
          // Refresh cached data
          await fetchData(user.uid, true);
          // Fetch garden-specific data
          await fetchGardenData();
        } catch (err) {
          console.error("Initial sync failed:", err);
        }
      };

      doInitialSync();

      // Setup auto-sync every 15 minutes
      const intervalId = setInterval(
        async () => {
          try {
            console.log("[GardenScreen] Auto-syncing steps...");
            await syncTodaysStepsFromHealthKit(user.uid);
            // Refresh cached data
            await fetchData(user.uid, true);
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
  }, [user, fetchData]);

  // Fetch cached data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchData(user.uid); // Will use cache if fresh
        fetchGardenData(); // Refresh garden-specific data
      }
    }, [user, fetchData])
  );

  // Pull to refresh
  const onRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      // Force sync steps from HealthKit
      await syncTodaysStepsFromHealthKit(user.uid);
      // Force refresh cached data
      await fetchData(user.uid, true);
      // Refresh garden data
      await fetchGardenData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // Map growth level to one of 6 tree stages (0-5)
  const getTreeStage = (level: number): number => {
    if (level === 0) return 0;
    if (level <= 1) return 1;
    if (level <= 2) return 2;
    if (level <= 3) return 3;
    if (level <= 4) return 4;
    return 5;
  };

  // Get the appropriate tree image based on stage
  const getTreeImage = (stage: number) => {
    const treeImages = [
      require("@/assets/maiArt/tree0/tree_stage_0.png"),
      require("@/assets/maiArt/tree0/tree_stage_1.png"),
      require("@/assets/maiArt/tree0/tree_stage_2.png"),
      require("@/assets/maiArt/tree0/tree_stage_3.png"),
      require("@/assets/maiArt/tree0/tree_stage_4.png"),
      require("@/assets/maiArt/tree0/tree_stage_5.png"),
    ];
    return treeImages[stage] || treeImages[0];
  };

  // Calculate progress to next level - now using userData from context
  const getProgressToNextLevel = () => {
    if (!userData) {
      return {
        progress: 0,
        stepsInLevel: 0,
        stepsNeeded: 10000,
        isMaxLevel: false,
      };
    }

    const treeLevel = userData.garden?.tree?.growthLevel || 0;
    const totalStepsContributed =
      userData.garden?.tree?.totalStepsContributed || 0;
    const currentLevelSteps = treeLevel * 10000;
    const nextLevelSteps = (treeLevel + 1) * 10000;
    const stepsInCurrentLevel = totalStepsContributed - currentLevelSteps;
    const stepsNeededForLevel = nextLevelSteps - currentLevelSteps;

    if (treeLevel >= 5) {
      return { progress: 1, stepsInLevel: 0, stepsNeeded: 0, isMaxLevel: true };
    }

    return {
      progress: Math.min(stepsInCurrentLevel / stepsNeededForLevel, 1),
      stepsInLevel: stepsInCurrentLevel,
      stepsNeeded: stepsNeededForLevel,
      isMaxLevel: false,
    };
  };

  const treeLevel = userData?.garden?.tree?.growthLevel || 0;
  const currentTreeStage = getTreeStage(treeLevel);
  const progressInfo = getProgressToNextLevel();

  // OLD CODE:
  // const getDecorationInSlot = (slotX: number, slotY: number) => {
  //   return placedDecorations.find(dec => dec.x === slotX && dec.y === slotY);
  // };

  // NEW CODE - Check if a slot is occupied by finding decoration at coordinates
  const getSlotDecoration = (slotX: number, slotY: number) => {
    return placedDecorations.find((dec) => dec.x === slotX && dec.y === slotY);
  };

  // Handle placing decoration
  const handlePlaceDecoration = async (instanceId: string) => {
    if (selectedSlot === null) return;

    if (!user) return;

    try {
      await placeDecorationInGarden(
        user.uid,
        instanceId,
        selectedSlot.x,
        selectedSlot.y
      );
      await fetchGardenData(); // Refresh data
      setShowInventory(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Error placing decoration:", error);
      alert("Failed to place decoration");
    }
  };

  // Handle removing decoration
  const handleRemoveDecoration = async (instanceId: string) => {
    if (!user) return;

    try {
      await removeDecorationFromGarden(user.uid, instanceId);
      await fetchGardenData(); // Refresh data
    } catch (error) {
      console.error("Error removing decoration:", error);
      alert("Failed to remove decoration");
    }
  };

  // Get available instances (not placed in garden)
  const getAvailableInstances = () => {
    const placedInstanceIds = placedDecorations.map((dec) => dec.instanceId);
    const available: {
      decorationId: string;
      instanceId: string;
      name: string | null;
    }[] = [];

    inventory.forEach((item) => {
      item.instances.forEach((instance) => {
        if (!placedInstanceIds.includes(instance.instanceId)) {
          available.push({
            decorationId: item.decorationId,
            instanceId: instance.instanceId,
            name: instance.name,
          });
        }
      });
    });

    console.log("Available instances:", available);
    console.log("Total inventory items:", inventory.length);
    console.log("Placed decorations count:", placedDecorations.length);

    return available;
  };

  // Get decoration image from itemMap
  const getDecorationImage = (decorationId: string) => {
    // FIX: Cast itemMap to allow dynamic key access with string type
    const image = (itemMap as Record<string, any>)[decorationId];
    console.log(
      `Getting image for decorationId: ${decorationId}`,
      image ? "Found" : "NOT FOUND"
    );
    return image || require("@/assets/no_image.jpg");
  };

  // Get instance info including decorationId
  const getInstanceInfo = (instanceId: string) => {
    for (const item of inventory) {
      const instance = item.instances.find(
        (inst) => inst.instanceId === instanceId
      );
      if (instance) {
        return {
          decorationId: item.decorationId,
          instance: instance,
        };
      }
    }
    return null;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <HamburgerMenu />
      {/* Background */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowTreeInfo(true)}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require("@/assets/blank_backdrop.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Coin and currency */}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
          >
            <Image
              source={require("@/assets/pommeCoin.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 20,
                color: "#733E39",
                fontFamily: "Pixelify Sans",
              }}
            >
              {userData?.pomes || 0}
            </Text>
          </View>

          {/* Tree positioned at bottom of blue area, extending from grass */}
          <View style={styles.treePositioner}>
            {/* Tree Container with higher z-index */}
            <View style={[
              styles.treeContainer,
              currentTreeStage === 0 && { marginTop: 500 }, // Seed: less margin
              currentTreeStage === 1 && { marginTop: 450 }, // Sapling: moderate margin
            ]}>
              <Image
                source={getTreeImage(currentTreeStage)}
                style={[
                  styles.treeImage,
                  currentTreeStage === 0 && { width: 20, height: 20 }, // Seed: much smaller
                  currentTreeStage === 1 && { width: 100, height: 100 }, // Sapling: smaller
                  currentTreeStage >= 2 && { width: 300, height: 300 }, // Tree: much larger
                ]}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Garden Area */}
          <View style={styles.gardenArea}>
            {/* Decorations Grid - NEW CODE: 3 MIDDLE + 2 BOTTOM SLOTS */}
            <View style={styles.gardenContent}>
              {/* Middle Row - Left, Center, Right */}
              <View style={styles.middleRow}>
                {/* Left Slot */}
                <View style={styles.decorationSlot}>
                  {(() => {
                    const decoration = getSlotDecoration(-1, 0);
                    if (decoration) {
                      const instanceInfo = getInstanceInfo(decoration.instanceId);
                      return (
                        <TouchableOpacity
                          style={styles.placedDecoration}
                          onPress={() =>
                            handleRemoveDecoration(decoration.instanceId)
                          }
                        >
                          {instanceInfo && (
                            <Image
                              source={getDecorationImage(instanceInfo.decorationId)}
                              style={styles.decorationImage}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={styles.removeText}>Tap to remove</Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          style={styles.emptySlot}
                          onPress={() => {
                            setSelectedSlot({ x: -1, y: 0 });
                            setShowInventory(true);
                          }}
                        >
                          <Text style={styles.slotText}>+</Text>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                </View>

                {/* Center Slot */}
                <View style={styles.decorationSlot}>
                  {(() => {
                    const decoration = getSlotDecoration(0, 0);
                    if (decoration) {
                      const instanceInfo = getInstanceInfo(decoration.instanceId);
                      return (
                        <TouchableOpacity
                          style={styles.placedDecoration}
                          onPress={() =>
                            handleRemoveDecoration(decoration.instanceId)
                          }
                        >
                          {instanceInfo && (
                            <Image
                              source={getDecorationImage(instanceInfo.decorationId)}
                              style={styles.decorationImage}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={styles.removeText}>Tap to remove</Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          style={styles.emptySlot}
                          onPress={() => {
                            setSelectedSlot({ x: 0, y: 0 });
                            setShowInventory(true);
                          }}
                        >
                          <Text style={styles.slotText}>+</Text>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                </View>

                {/* Right Slot */}
                <View style={styles.decorationSlot}>
                  {(() => {
                    const decoration = getSlotDecoration(1, 0);
                    if (decoration) {
                      const instanceInfo = getInstanceInfo(decoration.instanceId);
                      return (
                        <TouchableOpacity
                          style={styles.placedDecoration}
                          onPress={() =>
                            handleRemoveDecoration(decoration.instanceId)
                          }
                        >
                          {instanceInfo && (
                            <Image
                              source={getDecorationImage(instanceInfo.decorationId)}
                              style={styles.decorationImage}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={styles.removeText}>Tap to remove</Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          style={styles.emptySlot}
                          onPress={() => {
                            setSelectedSlot({ x: 1, y: 0 });
                            setShowInventory(true);
                          }}
                        >
                          <Text style={styles.slotText}>+</Text>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                </View>
              </View>

              {/* Bottom Row - Bottom Left and Bottom Right */}
              <View style={styles.bottomRow}>
                {/* Bottom Left Slot */}
                <View style={styles.decorationSlot}>
                  {(() => {
                    const decoration = getSlotDecoration(-0.5, 1);
                    if (decoration) {
                      const instanceInfo = getInstanceInfo(decoration.instanceId);
                      return (
                        <TouchableOpacity
                          style={styles.placedDecoration}
                          onPress={() =>
                            handleRemoveDecoration(decoration.instanceId)
                          }
                        >
                          {instanceInfo && (
                            <Image
                              source={getDecorationImage(instanceInfo.decorationId)}
                              style={styles.decorationImage}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={styles.removeText}>Tap to remove</Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          style={styles.emptySlot}
                          onPress={() => {
                            setSelectedSlot({ x: -0.5, y: 1 });
                            setShowInventory(true);
                          }}
                        >
                          <Text style={styles.slotText}>+</Text>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                </View>

                {/* Bottom Right Slot */}
                <View style={styles.decorationSlot}>
                  {(() => {
                    const decoration = getSlotDecoration(0.5, 1);
                    if (decoration) {
                      const instanceInfo = getInstanceInfo(decoration.instanceId);
                      return (
                        <TouchableOpacity
                          style={styles.placedDecoration}
                          onPress={() =>
                            handleRemoveDecoration(decoration.instanceId)
                          }
                        >
                          {instanceInfo && (
                            <Image
                              source={getDecorationImage(instanceInfo.decorationId)}
                              style={styles.decorationImage}
                              resizeMode="contain"
                            />
                          )}
                          <Text style={styles.removeText}>Tap to remove</Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity
                          style={styles.emptySlot}
                          onPress={() => {
                            setSelectedSlot({ x: 0.5, y: 1 });
                            setShowInventory(true);
                          }}
                        >
                          <Text style={styles.slotText}>+</Text>
                        </TouchableOpacity>
                      );
                    }
                  })()}
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Inventory Modal */}
      <Modal
        visible={showInventory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowInventory(false);
          setSelectedSlot(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Decoration</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowInventory(false);
                  setSelectedSlot(null);
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.inventoryList}>
              {(() => {
                const availableItems = getAvailableInstances();
                console.log(
                  "Rendering inventory items, count:",
                  availableItems.length
                );

                if (availableItems.length === 0) {
                  return (
                    <Text style={styles.emptyInventoryText}>
                      No decorations available. Buy some from the shop!
                    </Text>
                  );
                }

                return availableItems.map((item) => {
                  console.log(
                    "Rendering item:",
                    item.decorationId,
                    item.instanceId
                  );
                  return (
                    <TouchableOpacity
                      key={item.instanceId}
                      style={styles.inventoryItem}
                      onPress={() => handlePlaceDecoration(item.instanceId)}
                    >
                      <Image
                        source={getDecorationImage(item.decorationId)}
                        style={styles.inventoryItemImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.inventoryItemText}>
                        {item.name || item.decorationId}
                      </Text>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Tree Info Popup */}
      <Modal
        visible={showTreeInfo}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTreeInfo(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setShowTreeInfo(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>Tree Info</Text>
              <View style={styles.popupDivider} />
              <View style={styles.popupInfoRow}>
                <Text style={styles.popupLabel}>Stage:</Text>
                <Text style={styles.popupValue}>{currentTreeStage} / 5</Text>
              </View>
              <View style={styles.popupInfoRow}>
                <Text style={styles.popupLabel}>Total Steps:</Text>
                <Text style={styles.popupValue}>
                  {(userData?.garden?.tree?.totalStepsContributed || 0).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.popupCloseButton}
                onPress={() => setShowTreeInfo(false)}
              >
                <Text style={styles.popupCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleContainer: {
    backgroundColor: "#EAD4AA",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    minHeight: 68,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Pixelify Sans",
    fontSize: 48,
    fontWeight: "600",
    color: "#733E39",
  },
  treePositioner: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    paddingBottom: 0,
    margin: -100,
  },
  growthInfoContainer: {
    alignItems: "center",
    marginBottom: 15,
    zIndex: 5,
    backgroundColor: "rgba(234, 212, 170, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
  },
  treeStageText: {
    fontFamily: "Pixelify Sans",
    fontSize: 20,
    fontWeight: "700",
    color: "#733E39",
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "100%",
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#D4B896",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#733E39",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#7CB342",
    borderRadius: 4,
  },
  progressText: {
    fontFamily: "Pixelify Sans",
    fontSize: 14,
    color: "#733E39",
    fontWeight: "600",
  },
  maxLevelText: {
    fontFamily: "Pixelify Sans",
    fontSize: 16,
    color: "#733E39",
    fontWeight: "700",
    marginTop: 4,
  },
  gardenArea: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  gardenContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    flex: 1,
    marginTop: 60,
    paddingTop: 20,
  },
  treeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 250,
    zIndex: 10,
  },
  decorationsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    zIndex: 1,
  },
  treeImage: {
    width: 150,
    height: 150,
  },
  treeLevelText: {
    fontFamily: "Pixelify Sans",
    fontSize: 18,
    fontWeight: "600",
    color: "#733E39",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    zIndex: 10,
  },
  treeSpacePlaceholder: {
    width: 80,
  },
  decorationSlot: {
    width: 80,
    height: 80,
    zIndex: 1,
  },
  emptySlot: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#733E39",
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  slotText: {
    fontSize: 40,
    color: "#733E39",
    fontWeight: "600",
  },
  placedDecoration: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  decorationImage: {
    width: 80,
    height: 80,
  },
  removeText: {
    fontSize: 10,
    color: "#733E39",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#EAD4AA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: "Pixelify Sans",
    fontSize: 24,
    fontWeight: "600",
    color: "#733E39",
  },
  closeButton: {
    fontSize: 30,
    color: "#733E39",
    fontWeight: "600",
  },
  inventoryList: {
    flexGrow: 1,
  },
  inventoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#733E39",
  },
  inventoryItemImage: {
    width: 50,
    height: 50,
    marginRight: 15,
    backgroundColor: "#f0f0f0",
  },
  inventoryItemText: {
    fontSize: 18,
    color: "#733E39",
    fontWeight: "600",
  },
  emptyInventoryText: {
    fontFamily: "Pixelify Sans",
    fontSize: 16,
    color: "#733E39",
    textAlign: "center",
    marginTop: 20,
  },
  // NEW CODE - Updated decorations layout styles
  decorationsContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 0,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  // Tree Info Popup Styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "#EAD4AA",
    borderRadius: 20,
    padding: 30,
    minWidth: 280,
    borderWidth: 3,
    borderColor: "#733E39",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  popupTitle: {
    fontFamily: "Pixelify Sans",
    fontSize: 28,
    fontWeight: "700",
    color: "#733E39",
    textAlign: "center",
    marginBottom: 15,
  },
  popupDivider: {
    height: 2,
    backgroundColor: "#733E39",
    marginBottom: 20,
    borderRadius: 1,
  },
  popupInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  popupLabel: {
    fontFamily: "Pixelify Sans",
    fontSize: 18,
    fontWeight: "600",
    color: "#733E39",
  },
  popupValue: {
    fontFamily: "Pixelify Sans",
    fontSize: 18,
    fontWeight: "700",
    color: "#7CB342",
  },
  popupCloseButton: {
    backgroundColor: "#733E39",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
    alignItems: "center",
  },
  popupCloseButtonText: {
    fontFamily: "Pixelify Sans",
    fontSize: 16,
    fontWeight: "600",
    color: "#EAD4AA",
  },
});
