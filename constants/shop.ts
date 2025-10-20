export interface ShopItem {
  id: string;
  type: "lootbox" | "decoration" | "theme";
  name: string;
  price: number;
  imagePath: string;
  lootTable?: { itemId: string; weight: number }[];
  decorationId?: string;
  themeId?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "lootbox-bronze",
    type: "lootbox",
    name: "Bronze Mystery Box",
    price: 100,
    imagePath: "assets/shop/lootbox_bronze.png",
    lootTable: [
      { itemId: "dog", weight: 40 },
      { itemId: "flower1", weight: 40 },
      { itemId: "cat", weight: 20 }
    ]
  },
  {
    id: "lootbox-silver",
    type: "lootbox",
    name: "Silver Mystery Box",
    price: 500,
    imagePath: "assets/shop/lootbox_silver.png",
    lootTable: [
      { itemId: "cat", weight: 30 },
      { itemId: "fountain", weight: 50 },
      { itemId: "statue", weight: 20 }
    ]
  }
];