


import { SHOP_ITEMS } from "@/constants/shop";
import { buyMysteryBoxAndAddToInventory } from "./userService";

export interface BuyBoxResult {
  price: number;
  newBalance: number;
  award: { decorationId: string; instanceId: string };
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

  return {
    price,
    newBalance,
    award: { decorationId, instanceId }
  };
}
