import { SHOP_ITEMS } from "@/constants/shop";
import { buyMysteryBoxAndAddToInventory, getUserDocument, placeDecorationInGarden } from "./userService";

export interface BuyBoxResult {
  price: number;
  newBalance: number;
  award: { decorationId: string; instanceId: string };
  wasPlacedInGarden: boolean; // NEW CODE - tracks if item was auto-placed
}

function getLootbox() {
  const box = SHOP_ITEMS.find(s => s.type === "lootbox" && s.id === "lootbox");
  if (!box) throw new Error("Mystery Box not found in SHOP_ITEMS");
  if (!box.lootTable?.length) throw new Error("Mystery Box lootTable is empty");
  return box;
}

function weightedRoll(table: { itemId: string; weight: number }[]): string {
  const total = table.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const row of table) {
    r -= row.weight;
    if (r < 0) return row.itemId;
  }
  return table[table.length - 1].itemId; // fallback
}

export async function buyMysteryBox(userId: string): Promise<BuyBoxResult> {
  const box = getLootbox();
  const price = box.price;

  // roll one reward
  const decorationId = weightedRoll(box.lootTable!);

  // atomically charge + add to embedded inventory
  const { instanceId, newBalance } = await buyMysteryBoxAndAddToInventory(
    userId,
    decorationId,
    price
  );

  // NEW CODE - TRY TO RANDOMLY PLACE THE ITEM IN AN EMPTY SLOT
  let wasPlacedInGarden = false;
  try {
    // Get current user data to check available slots
    const user = await getUserDocument(userId);
    console.log("User garden decorations count:", user?.garden.decorations.length);
    console.log("Max decorations:", user?.garden.maxDecorations);
    
    if (user && user.garden.decorations.length < user.garden.maxDecorations) {
      console.log("Attempting to place item randomly in garden...");
      // Try to place the item randomly in an empty slot
      // Skip inventory check since we just added it in the transaction above
      await placeDecorationInGarden(userId, instanceId, undefined, undefined, true, true);
      wasPlacedInGarden = true;
      console.log("✅ Item placed randomly in garden successfully!");
    } else {
      console.log("⚠️ No empty slots available or user not found");
    }
  } catch (error) {
    // If placement fails (no empty slots), item stays in inventory
    console.log("❌ Could not place item in garden, keeping in inventory:", error);
    wasPlacedInGarden = false;
  }

  return {
    price,
    newBalance,
    award: { decorationId, instanceId },
    wasPlacedInGarden // NEW CODE - return this info
  };
}
