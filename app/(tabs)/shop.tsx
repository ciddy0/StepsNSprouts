

// Minimal screen to buy the Mystery Box and display plain text results.
// Frontend can later replace the text with styled UI.

import { SHOP_ITEMS } from "@/constants/shop";
import { useAuth } from "@/context/AuthContext";
import { buyMysteryBox } from "@/services/api/lootService";
import { useMemo, useState } from "react";
import { ActivityIndicator, Button, Platform, ScrollView, Text, View } from "react-native";

export default function ShopScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [log, setLog] = useState<string>("");

  const [award, setAward] = useState<{ decorationId: string; instanceId: string } | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const box = useMemo(() => SHOP_ITEMS.find(x => x.type === "lootbox" && x.id === "lootbox"), []);

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

      setLog(
        [
          `Purchased: ${box.name} (price: ${res.price} pomes)`,
          `Award: ${res.award.decorationId} (instance: ${res.award.instanceId})`,
          `New balance: ${res.newBalance}`
        ].join("\n")
      );
      setStatus("done");
    } catch (e: any) {
      setStatus("error");
      setLog(`ERROR: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Shop (Dev Minimal)</Text>

      {!box && <Text>No loot boxes available. Add one in constants/shop.ts.</Text>}

      {box && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{box.name}</Text>
          <Text>Price: {box.price} pomes</Text>
          <Button title="Buy Mystery Box" onPress={buy} disabled={status === "loading"} />
        </View>
      )}

      {status === "loading" && <ActivityIndicator />}

      {/* ===== FE PICKUP: Replace this with a styled success card / modal ===== */}
      {status === "done" && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Result</Text>
          <Text selectable style={{ fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) }}>
            {log}
          </Text>
          {award && (
            <Text>(FE: map decorationId "{award.decorationId}" to art and show a reveal.)</Text>
          )}
          {newBalance !== null && <Text>(FE: update wallet display to {newBalance} pomes.)</Text>}
        </View>
      )}

      {/* ===== FE PICKUP: Replace with a styled error toast ===== */}
      {status === "error" && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600" }}>Error</Text>
          <Text selectable style={{ fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) }}>
            {log}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
