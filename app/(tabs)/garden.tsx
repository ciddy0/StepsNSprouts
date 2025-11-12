import itemMap from '@/constants/inventoryItems';
import { getUserDocument, placeDecorationInGarden, removeDecorationFromGarden } from '@/services/api/userService';
import { auth } from '@/services/firebase/config';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [username, setUsername] = useState('');
  const [treeLevel, setTreeLevel] = useState(0);
  const [totalStepsContributed, setTotalStepsContributed] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [placedDecorations, setPlacedDecorations] = useState<PlacedDecoration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Preset locations for decorations (left and right of tree)
  const decorationSlots = [
    { x: 0, y: 0, position: 'left' },   // Left slot
    { x: 1, y: 0, position: 'right' },  // Right slot
  ];

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getUserDocument(currentUser.uid);
        if (userDoc) {
          setUsername(userDoc.username || 'User');
          setTreeLevel(userDoc.garden?.tree?.growthLevel || 0);
          setTotalStepsContributed(userDoc.garden?.tree?.totalStepsContributed || 0);
          setInventory(userDoc.inventory || []);
          setPlacedDecorations(userDoc.garden?.decorations || []);
          
          // Debug logging
          console.log('User inventory:', userDoc.inventory);
          console.log('Placed decorations:', userDoc.garden?.decorations);
        } else {
          setUsername('User');
          setTreeLevel(0);
          setTotalStepsContributed(0);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUsername('User');
      setTreeLevel(0);
      setTotalStepsContributed(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
      require('@/assets/maiArt/tree0/tree_stage_0.png'),
      require('@/assets/maiArt/tree0/tree_stage_1.png'),
      require('@/assets/maiArt/tree0/tree_stage_2.png'),
      require('@/assets/maiArt/tree0/tree_stage_3.png'),
      require('@/assets/maiArt/tree0/tree_stage_4.png'),
      require('@/assets/maiArt/tree0/tree_stage_5.png'),
    ];
    return treeImages[stage] || treeImages[0];
  };

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
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

  const currentTreeStage = getTreeStage(treeLevel);
  const progressInfo = getProgressToNextLevel();

  // Check if a slot is occupied
  const getDecorationInSlot = (slotX: number, slotY: number) => {
    return placedDecorations.find(dec => dec.x === slotX && dec.y === slotY);
  };

  // Handle placing decoration
  const handlePlaceDecoration = async (instanceId: string) => {
    if (selectedSlot === null) return;

    const slot = decorationSlots[selectedSlot];
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await placeDecorationInGarden(currentUser.uid, instanceId, slot.x, slot.y);
      await fetchUserData(); // Refresh data
      setShowInventory(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error placing decoration:', error);
      alert('Failed to place decoration');
    }
  };

  // Handle removing decoration
  const handleRemoveDecoration = async (instanceId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await removeDecorationFromGarden(currentUser.uid, instanceId);
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error removing decoration:', error);
      alert('Failed to remove decoration');
    }
  };

  // Get available instances (not placed in garden)
  const getAvailableInstances = () => {
    const placedInstanceIds = placedDecorations.map(dec => dec.instanceId);
    const available: { decorationId: string; instanceId: string; name: string | null }[] = [];
    
    inventory.forEach(item => {
      item.instances.forEach(instance => {
        if (!placedInstanceIds.includes(instance.instanceId)) {
          available.push({
            decorationId: item.decorationId,
            instanceId: instance.instanceId,
            name: instance.name,
          });
        }
      });
    });
    
    console.log('Available instances:', available);
    console.log('Total inventory items:', inventory.length);
    console.log('Placed decorations count:', placedDecorations.length);
    
    return available;
  };

  // Get decoration image from itemMap
  const getDecorationImage = (decorationId: string) => {
    const image = itemMap[decorationId];
    console.log(`Getting image for decorationId: ${decorationId}`, image ? 'Found' : 'NOT FOUND');
    return image || require('@/assets/no_image.jpg');
  };

  // Get instance info including decorationId
  const getInstanceInfo = (instanceId: string) => {
    for (const item of inventory) {
      const instance = item.instances.find(inst => inst.instanceId === instanceId);
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
    <View style={styles.container}>
      {/* Blue Sky Background - Upper Half */}
      <ImageBackground
        source={require('@/assets/blue_background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Title with Username */}
        <View style={styles.titleContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#733E39" />
          ) : (
            <Text style={styles.title}>{username}'s Garden</Text>
          )}
        </View>

        {/* Tree positioned at bottom of blue area, extending from grass */}
        <View style={styles.treePositioner}>
          {/* Growth Progress Info - Above Tree */}
          <View style={styles.growthInfoContainer}>
            <Text style={styles.treeStageText}>
              Stage {currentTreeStage} / 5
            </Text>
            
            {!progressInfo.isMaxLevel ? (
              <>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { width: `${progressInfo.progress * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                
                <Text style={styles.progressText}>
                  {progressInfo.stepsInLevel.toLocaleString()} / {progressInfo.stepsNeeded.toLocaleString()} steps
                </Text>
              </>
            ) : (
              <Text style={styles.maxLevelText}>🌟 Max Level! 🌟</Text>
            )}
          </View>

          {/* Tree Container with higher z-index */}
          <View style={styles.treeContainer}>
            <Image
              source={getTreeImage(currentTreeStage)}
              style={styles.treeImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </ImageBackground>

      {/* Garden Area with Grass Patch Background - Lower Half */}
      <ImageBackground
        source={require('@/assets/grass_patch.png')}
        style={styles.gardenArea}
        resizeMode="cover"
      >
        {/* Decorations Row */}
        <View style={styles.decorationsRow}>
          {/* Left Decoration Slot */}
          <View style={styles.decorationSlot}>
            {(() => {
              const decoration = getDecorationInSlot(0, 0);
              if (decoration) {
                const instanceInfo = getInstanceInfo(decoration.instanceId);
                return (
                  <TouchableOpacity
                    style={styles.placedDecoration}
                    onPress={() => handleRemoveDecoration(decoration.instanceId)}
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
                      setSelectedSlot(0);
                      setShowInventory(true);
                    }}
                  >
                    <Text style={styles.slotText}>+</Text>
                  </TouchableOpacity>
                );
              }
            })()}
          </View>

          {/* Spacer for tree trunk */}
          <View style={styles.treeSpacePlaceholder} />

          {/* Right Decoration Slot */}
          <View style={styles.decorationSlot}>
            {(() => {
              const decoration = getDecorationInSlot(1, 0);
              if (decoration) {
                const instanceInfo = getInstanceInfo(decoration.instanceId);
                return (
                  <TouchableOpacity
                    style={styles.placedDecoration}
                    onPress={() => handleRemoveDecoration(decoration.instanceId)}
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
                      setSelectedSlot(1);
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
      </ImageBackground>

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
                console.log('Rendering inventory items, count:', availableItems.length);
                
                if (availableItems.length === 0) {
                  return (
                    <Text style={styles.emptyInventoryText}>
                      No decorations available. Buy some from the shop!
                    </Text>
                  );
                }
                
                return availableItems.map((item) => {
                  console.log('Rendering item:', item.decorationId, item.instanceId);
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
    </View>
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
    backgroundColor: '#EAD4AA',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    minHeight: 68,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Pixelify Sans',
    fontSize: 48,
    fontWeight: '600',
    color: '#733E39',
  },
  treePositioner: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1, 
    paddingBottom: 0, 
    margin: -100, 
  },
  growthInfoContainer: {
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 5,
    backgroundColor: 'rgba(234, 212, 170, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 200,
  },
  treeStageText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 20,
    fontWeight: '700',
    color: '#733E39',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 6,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#D4B896',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#733E39',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7CB342',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 14,
    color: '#733E39',
    fontWeight: '600',
  },
  maxLevelText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 16,
    color: '#733E39',
    fontWeight: '700',
    marginTop: 4,
  },
  gardenArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gardenContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flex: 1,
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
    zIndex: 10,
  },
  decorationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    zIndex: 1,
  },
  treeImage: {
    width: 150,
    height: 150,
  },
  treeLevelText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 18,
    fontWeight: '600',
    color: '#733E39',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    borderColor: '#733E39',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 40,
    color: '#733E39',
    fontWeight: '600',
  },
  placedDecoration: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorationImage: {
    width: 80,
    height: 80,
  },
  removeText: {
    fontSize: 10,
    color: '#733E39',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#EAD4AA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Pixelify Sans',
    fontSize: 24,
    fontWeight: '600',
    color: '#733E39',
  },
  closeButton: {
    fontSize: 30,
    color: '#733E39',
    fontWeight: '600',
  },
  inventoryList: {
    flexGrow: 1,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#733E39',
  },
  inventoryItemImage: {
    width: 50,
    height: 50,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  inventoryItemText: {
    fontSize: 18,
    color: '#733E39',
    fontWeight: '600',
  },
  emptyInventoryText: {
    fontFamily: 'Pixelify Sans',
    fontSize: 16,
    color: '#733E39',
    textAlign: 'center',
    marginTop: 20,
  },
});