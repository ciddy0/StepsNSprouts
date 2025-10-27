import { User as FirebaseUser } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { User } from "../firebase/collections/user";
import { db } from "../firebase/config";

/**
 * Check if username is already taken
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

/**
 * Initialize new user with default values
 */
export async function initializeNewUser(
  firebaseUser: FirebaseUser, 
  username: string
): Promise<void> {
  const userId = firebaseUser.uid;
  
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  
  if (docSnap.exists()) {
    console.log("User already initialized");
    return;
  }

  // Check if username is taken
  const usernameTaken = await isUsernameTaken(username);
  if (usernameTaken) {
    throw new Error("Username is already taken");
  }

  const now = new Date().toISOString();
  
  const newUser: User = {
    id: userId,
    email: firebaseUser.email || "",
    username: username.toLowerCase(),
    firstName: "",
    lastName: "",
    profilePicture: "",
    pomes: 0,
    stepGoal: 10000,
    totalSteps: 0,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: now,
    lastActive: now,
    healthKitConnected: false,
    notificationsEnabled: true,
    garden: {
      theme: "default_garden_theme",
      maxDecorations: 20,
      decorations: [],
      tree: {
        species: "default_tree_theme",
        growthLevel: 0,
        lastWatered: now,
        totalStepsContributed: 0
      },
      createdAt: now,
      lastModified: now
    },
    inventory: [],
    achievements: []
  };

  await setDoc(userRef, newUser);
  console.log("User initialized with username:", username);
}

/**
 * Get user document
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
}

/**
 * Update user profile fields
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<User>
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    lastActive: new Date().toISOString()
  });
}

/**
 * Update user's pomes (currency)
 */
export async function updateUserPomes(
  userId: string, 
  amount: number
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const newAmount = user.pomes + amount;
  if (newAmount < 0) throw new Error("Insufficient pomes");
  
  await updateUserProfile(userId, { pomes: newAmount });
}

/**
 * Update user's garden
 */
export async function updateUserGarden(
  userId: string, 
  gardenUpdates: Partial<User["garden"]>
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const updatedGarden = {
    ...user.garden,
    ...gardenUpdates,
    lastModified: new Date().toISOString()
  };
  
  await updateUserProfile(userId, { garden: updatedGarden });
}

/**
 * Place decoration in garden
 */
export async function placeDecorationInGarden(
  userId: string,
  instanceId: string,
  x: number,
  y: number
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  // Check if instance exists in inventory
  const hasInstance = user.inventory.some(item => 
    item.instances.some(inst => inst.instanceId === instanceId)
  );
  if (!hasInstance) throw new Error("Decoration not found in inventory");
  
  // Check if already placed
  const alreadyPlaced = user.garden.decorations.some(
    dec => dec.instanceId === instanceId
  );
  if (alreadyPlaced) throw new Error("Decoration already placed");
  
  // Check max decorations
  if (user.garden.decorations.length >= user.garden.maxDecorations) {
    throw new Error("Maximum decorations reached");
  }
  
  const newDecoration = {
    instanceId,
    x,
    y,
    dateAdded: new Date().toISOString()
  };
  
  const updatedDecorations = [...user.garden.decorations, newDecoration];
  await updateUserGarden(userId, { decorations: updatedDecorations });
}

/**
 * Remove decoration from garden
 */
export async function removeDecorationFromGarden(
  userId: string,
  instanceId: string
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const updatedDecorations = user.garden.decorations.filter(
    dec => dec.instanceId !== instanceId
  );
  
  await updateUserGarden(userId, { decorations: updatedDecorations });
}

/**
 * Add decoration to inventory
 */
export async function addDecorationToInventory(
  userId: string,
  decorationId: string
): Promise<string> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const instanceId = `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newInstance = {
    instanceId,
    name: null,
    dateAcquired: new Date().toISOString()
  };
  
  const inventory = [...user.inventory];
  const existingItem = inventory.find(item => item.decorationId === decorationId);
  
  if (existingItem) {
    existingItem.instances.push(newInstance);
  } else {
    inventory.push({
      decorationId,
      instances: [newInstance]
    });
  }
  
  await updateUserProfile(userId, { inventory });
  return instanceId;
}

/**
 * Rename decoration instance
 */
export async function renameDecorationInstance(
  userId: string,
  instanceId: string,
  newName: string
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const inventory = [...user.inventory];
  let found = false;
  
  for (const item of inventory) {
    const instance = item.instances.find(inst => inst.instanceId === instanceId);
    if (instance) {
      instance.name = newName;
      found = true;
      break;
    }
  }
  
  if (!found) throw new Error("Instance not found");
  
  await updateUserProfile(userId, { inventory });
}

/**
 * Add achievement to user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const hasAchievement = user.achievements.some(a => a.achievementId === achievementId);
  if (hasAchievement) {
    console.log("Achievement already unlocked");
    return;
  }
  
  const newAchievement = {
    achievementId,
    dateAcquired: new Date().toISOString()
  };
  
  const achievements = [...user.achievements, newAchievement];
  await updateUserProfile(userId, { achievements });
}

/**
 * Water tree (update tree stats)
 */
export async function waterTree(
  userId: string,
  stepsContributed: number
): Promise<void> {
  const user = await getUserDocument(userId);
  if (!user) throw new Error("User not found");
  
  const tree = { ...user.garden.tree };
  tree.totalStepsContributed += stepsContributed;
  tree.lastWatered = new Date().toISOString();
  
  // Growth logic: every 10,000 steps = 1 growth level
  tree.growthLevel = Math.floor(tree.totalStepsContributed / 10000);
  
  await updateUserGarden(userId, { tree });
}