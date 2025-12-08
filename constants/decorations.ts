export interface Decoration {
  id: string;
  name: string;
  imagePath: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export const DECORATIONS: Record<string, Decoration> = {
  "sunflower": {
    id: "sunflower",
    name: "Sunflower",
    imagePath: "../assets/items/sunflowert.png",
    rarity: "common"
  },
  "scarecrow": {
    id: "scarecrow",
    name: "Scarecrow",
    imagePath: "../assets/items/scarescrow.png",
    rarity: "common"
  },
  "snowman": {
    id: "snowman",
    name: "Snowman",
    imagePath: "../assets/items/Snowmant.png",
    rarity: "uncommon"
  },
  "capybara": {
    id: "capybara",
    name: "Capybara",
    imagePath: "../assets/items/capybara.png",
    rarity: "uncommon"
  },
  "gnome": {
    id: "gnome",
    name: "Garden Gnome",
    imagePath: "../assets/items/gnome.png",
    rarity: "rare"
  },
  "bonfire": {
    id: "bonfire",
    name: "Bonfire",
    imagePath: "../assets/items/bonfiret.png",
    rarity: "rare"
  },
  "bass": {
    id: "bass",
    name: "Bass Fish",
    imagePath: "../assets/items/basst.png",
    rarity: "epic"
  }
};