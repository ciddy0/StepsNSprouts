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
    id: "lootbox",
    type: "lootbox",
    name: "Mystery Box",
    price: 500,
    imagePath: "assets/shop/lootbox_silver.png",
    lootTable: [
      { itemId: "sunflower", weight: 25 },
      { itemId: "scarecrow", weight: 25 },
      { itemId: "snowman", weight: 20 },
      { itemId: "capybara", weight: 15 },
      { itemId: "gnome", weight: 8 },
      { itemId: "bonfire", weight: 5 },
      { itemId: "bass", weight: 2 }
    ]
  }
];