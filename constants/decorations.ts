export interface Decoration {
  id: string;
  name: string;
  imagePath: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export const DECORATIONS: Record<string, Decoration> = {
  "dog": {
    id: "dog",
    name: "Cute Dog",
    imagePath: "../assets/no_image/png",
    rarity: "common"
  },
  "flower1": {
    id: "flower1",
    name: "Red Flower",
    imagePath: "../assets/no_image/png",
    rarity: "common"
  },
  "cat": {
    id: "cat",
    name: "Sleepy Cat",
    imagePath: "../assets/no_image/png",
    rarity: "uncommon"
  },
  "fountain": {
    id: "fountain",
    name: "Magic Fountain",
    imagePath: "../assets/no_image/png",
    rarity: "rare"
  },
  "statue": {
    id: "statue",
    name: "Garden Statue",
    imagePath: "../assets/no_image/png",
    rarity: "epic"
  }
};