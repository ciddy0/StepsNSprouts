import { HamburgerMenu } from "@/components/HamburgerMenu";
import itemMap from "@/constants/inventoryItems";
import { SHOP_ITEMS } from "@/constants/shop";
import { useAuth } from "@/context/AuthContext";
import { buyMysteryBox } from "@/services/api/lootService";
import type { User } from '@/services/firebase/collections/user';
import { db } from '@/services/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, Pressable, ScrollView, Text, View } from "react-native";

export default function ShopScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [log, setLog] = useState<string>("");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  const [award, setAward] = useState<{ decorationId: string; instanceId: string } | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [wasPlacedInGarden, setWasPlacedInGarden] = useState<boolean>(false);

  const box = useMemo(() => SHOP_ITEMS.find(x => x.type === "lootbox" && x.id === "lootbox"), []);

  // Real-time pommes balance listener from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as User;
          setUserBalance(userData.pomes || 0);
        }
      },
      (error) => {
        console.error('Error listening to pomes balance:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const buy = async () => {
    if (!user?.uid) {
      setStatus("error");
      setLog("Not signed in.");
      return;
    }
    if (!box) {
      setStatus("error");
      setLog("Mystery Box not found in catalog.");
      return;
    }

    try {
      setStatus("loading");
      setLog("");
      const res = await buyMysteryBox(user.uid);

      setAward(res.award);
      setNewBalance(res.newBalance);
      setWasPlacedInGarden(res.wasPlacedInGarden);

      // Update the displayed balance
      setUserBalance(res.newBalance);

      const placementMessage = res.wasPlacedInGarden
        ? "✨ Item placed randomly in your garden!"
        : "📦 Item added to inventory (no empty garden slots)";

      setLog(
        [
          `Purchased: ${box.name} (price: ${res.price} pomes)`,
          `Award: ${res.award.decorationId} (instance: ${res.award.instanceId})`,
          placementMessage,
          `New balance: ${res.newBalance}`
        ].join("\n")
      );
      setStatus("done");
    } catch (e: any) {
      setStatus("error");
      setLog(`ERROR: ${e?.message ?? String(e)}`);
    }
  };

  const chestFrames = [
    require('@/assets/chest_frame_1.png'),
    require('@/assets/chest_frame_2.png'),
    require('@/assets/chest_frame_3.png'),
    require('@/assets/chest_frame_4.png'),
  ];

  const handlePurchase = async () => {
    setCurrentFrame(0);
    setShowReward(false);

    // Chest opening animation
    const frameInterval = setInterval(() => {
      setCurrentFrame((prevFrame) => {
        if (prevFrame >= chestFrames.length - 1) {
          clearInterval(frameInterval);
          return prevFrame;
        }
        return prevFrame + 1;
      });
    }, 150);

    await buy();
  };

  useEffect(() => {
    if (status === "done" && award) {
      setShowReward(true);
    }
  }, [status, award]);

  const handleCloseReward = () => {
    setShowReward(false);
    setCurrentFrame(0);
    setStatus("idle");
    setAward(null);
  };

  return (
    <>
      <HamburgerMenu />

      <View style={{ flex: 1, backgroundColor: '#8B4513' }}>
        <Image
          source={require('@/assets/blank_backdrop.png')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>

          {/*Main Game Panel*/}
          <View style={{ width: '100%', maxWidth: 600, aspectRatio: 3 / 5, position: 'relative' }}>
            {/*Brown Panel Frame*/}
            <Image
              source={require('@/assets/maiArt/panel_brown.png')}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              resizeMode="stretch"
            />
            {/*Content Container*/}
            <View style={{ flex: 1, paddingTop: 80, paddingHorizontal: 40, paddingBottom: 40, }}>

              {/* Title */}
              <ImageBackground
                source={require('@/assets/maiArt/button_long_brown.png')}
                style={{
                  position: 'absolute',
                  top: -5,
                  alignSelf: 'center',
                  width: 260,
                  height: 68,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                resizeMode="stretch"
              >
                <Text style={{
                  fontFamily: 'PixelifySans_700',
                  fontSize: 28,
                  color: '#623B2A',
                }}>
                  SHOP
                </Text>
              </ImageBackground>

              {/*Balance Display*/}
              {user && (
                <View style={{
                  position: 'absolute',
                  top: -70,
                  right: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#C28569',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#733E39',
                }}>
                  <Image
                    source={require('@/assets/pommeCoin.png')}
                    style={{ width: 32, height: 32 }}
                    resizeMode="contain"
                  />
                  <Text style={{
                    marginLeft: 6,
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#733E39',
                    fontFamily: 'PixelifySans_700',
                  }}>
                    {userBalance}
                  </Text>
                </View>
              )}

              {/* Main Content */}
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 24,
                marginTop: 40,
              }}>

                {/* Chest Display - Shows original chest when idle or error */}
                <View style={{
                  width: 256,
                  height: 256,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {(status === "idle" || status === "error") && (
                    <Image
                      source={chestFrames[0]}
                      style={{ width: '80%', height: '80%', top: -20 }}
                      resizeMode="contain"
                    />
                  )}

                  {(status === "loading" || status === "done") && currentFrame < chestFrames.length && (
                    <Image
                      source={chestFrames[currentFrame]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Mystery Box Info */}
                {box && (
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <Text style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#000000ff',
                      fontFamily: 'PixelifySans_700',
                      top: -70,
                    }}>
                      {box.name}
                    </Text>
                    <Text style={{
                      fontFamily: 'PixelifySans_400',
                      fontSize: 16,
                      color: 'rgba(10, 10, 10, 10)',
                      textAlign: 'center',
                      top: -70,
                    }}>
                      Unlock a random garden decoration!
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      top: -70,
                    }}>
                      <Image
                        source={require('@/assets/pommeCoin.png')}
                        style={{ width: 45, height: 50 }}
                        resizeMode="contain"
                      />
                      <Text style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#000000ff',
                        fontFamily: 'PixelifySans_700',
                        top: -1,
                      }}>
                        {box.price}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Purchase Button */}
                {status === "idle" && box && (
                  <Pressable
                    onPress={handlePurchase}
                    disabled={!user?.uid}
                    style={({ pressed }) => ({
                      width: 200,
                      height: 60,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#fbbf24',
                      borderRadius: 12,
                      borderWidth: 3,
                      borderColor: '#92400e',
                      opacity: !user?.uid ? 0.5 : pressed ? 0.8 : 1,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    })}
                  >
                    <Text style={{
                      fontFamily: 'PixelifySans_700',
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#ffffffff',
                      backgroundColor: '#fecc03ff',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: '#b45309ff',
                      top: -80
                    }}>
                      BUY NOW
                    </Text>
                  </Pressable>
                )}

                {/* Loading State */}
                {status === "loading" && (
                  <>
                    <ActivityIndicator size="large" color="#fbbf24" />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#fef3c7',
                      fontFamily: 'PixelifySans_700',
                    }}>
                      Opening...
                    </Text>
                  </>
                )}

                {/* Error State */}
                {status === "error" && (
                  <View style={{
                    backgroundColor: 'rgba(197, 86, 86, 1)',
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 4,
                    borderColor: '#a82222ff',
                    maxWidth: '90%',
                    gap: 12,
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: '#fca5a5',
                      fontWeight: 'bold',
                      fontFamily: 'PixelifySans_700',
                      textAlign: 'center',
                    }}>
                      {log}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setStatus("idle");
                        setLog("");
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: '#dc2626',
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 6,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontFamily: 'PixelifySans_700',
                        fontSize: 14,
                      }}>
                        DISMISS
                      </Text>
                    </Pressable>
                  </View>
                )}

              </View>
            </View>
          </View>
        </ScrollView>

        {/* Reward Modal */}
        {showReward && award && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}>
            <View style={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: 1,
              position: 'relative',
            }}>
              {/* Modal Panel */}
              <Image
                source={require('@/assets/maiArt/panel_brown.png')}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="stretch"
              />

              <View style={{
                flex: 1,
                padding: 32,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
              }}>
                <Text style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#000000ff',
                  fontFamily: 'PixelifySans_700',
                  top: 20,
                }}>
                  🎉 You Got!
                </Text>

                {/* Award Display */}
                <View style={{
                  backgroundColor: 'rgba(120, 53, 15, 0.3)',
                  borderRadius: 8,
                  padding: 2,
                  borderWidth: 2,
                  borderColor: '#ca8a04',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                }}>
                  <Image
                    source={itemMap[award.decorationId as keyof typeof itemMap]}
                    style={{ width: 110, height: 110 }}
                    resizeMode="contain"
                  />
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#0a0a0aff',
                    textAlign: 'center',
                    fontFamily: 'PixelifySans_700',
                  }}>
                    {award.decorationId}
                  </Text>
                </View>

                {/* Placement Info */}
                <Text style={{
                  fontFamily: 'PixelifySans_400',
                  color: '#000000ff',
                  fontSize: 14,
                  textAlign: 'center',
                }}>
                  {wasPlacedInGarden
                    ? "✨ Placed in your garden!"
                    : "📦 Added to inventory"}
                </Text>

                {/* New Balance */}
                {newBalance !== null && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    top: -10,
                  }}>
                    <Image
                      source={require('@/assets/pommeCoin.png')}
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                    />
                    <Text style={{
                      color: '#000000ff',
                      fontWeight: 'bold',
                      fontFamily: 'PixelifySans_700',
                    }}>
                      New Balance: {newBalance}
                    </Text>
                  </View>
                )}

                {/* Close Button */}
                <Pressable
                  onPress={handleCloseReward}
                  style={({ pressed }) => ({
                    width: 160,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 8,
                    backgroundColor: '#fbbf24',
                    borderRadius: 12,
                    borderWidth: 3,
                    borderColor: '#92400e',
                    opacity: pressed ? 0.8 : 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  })}
                >
                  <Text style={{
                    fontFamily: 'PixelifySans_700',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#000000ff',
                    backgroundColor: '#fbbf24',
                    top: -20,
                  }}>
                    CLOSE
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}