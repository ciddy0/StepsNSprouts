export interface DecorationInstance {
  instanceId: string;
  name: string | null;
  dateAcquired: string;
}

export interface InventoryItem {
  decorationId: string;
  instances: DecorationInstance[];
}

export interface GardenDecoration {
  instanceId: string;
  x: number;
  y: number;
  dateAdded: string;
}

export interface Tree {
  species: string;
  growthLevel: number;
  lastWatered: string;
  totalStepsContributed: number;
}

export interface Garden {
  theme: string;
  maxDecorations: number;
  decorations: GardenDecoration[];
  tree: Tree;
  createdAt: string;
  lastModified: string;
}

export interface UserAchievement {
  achievementId: string;
  dateAcquired: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string; // base64
  pomes: number; // currency
  age?: number;
  weight?: number;
  height?: number;
  stepGoal: number;
  totalSteps: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  lastActive: string;
  healthKitConnected: boolean;
  notificationsEnabled: boolean;
  garden: Garden;
  inventory: InventoryItem[];
  achievements: UserAchievement[];
}
