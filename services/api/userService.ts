import { User as FirebaseUser } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { Garden } from "../firebase/collections/garden";
import { Tree } from "../firebase/collections/tree";
import { User } from "../firebase/collections/user";
import { UserStat } from "../firebase/collections/userStat";
import { db } from "../firebase/config";

/**
 * 
 * Check if username is already taken
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

/**
 * Create user document when they sign up
 */
export async function initializeNewUser(firebaseUser: FirebaseUser, username: string) {
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

    const batch = writeBatch(db);

    // 1. Create User document
    const newUser: User = {
        id: userId,
        email: firebaseUser.email || "",
        username: username.toLowerCase(),
        firstName: "",
        lastName: "",
        stepGoal: 10000,
        pomes: 0,
        profilePicture: "",
    };
    batch.set(userRef, newUser);

    // 2. Create Tree document
    const treeId = `tree_${userId}`;
    const treeRef = doc(db, "trees", treeId);
    const newTree: Tree = {
        id: treeId,
        userId: userId,
        growthLevel: 0,
        themeId: "default_tree_theme",
    };
    batch.set(treeRef, newTree);

    // 3. Create Garden document
    const gardenId = `garden_${userId}`;
    const gardenRef = doc(db, "gardens", gardenId);
    const newGarden: Garden = {
        id: gardenId,
        userId: userId,
        themeId: "default_garden_theme",
        treeId: treeId,
    };
    batch.set(gardenRef, newGarden);

    await batch.commit();
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
 * Update user document
 */
export async function updateUser(user: User) {
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        stepGoal: user.stepGoal,
        pomes: user.pomes,
        profilePicture: user.profilePicture,
    });
}

/**
 * Get user stat document
 */
export async function getUserStatsDocument(userId: string, date: Date): Promise<UserStat | null> {
    const q = query(
      collection(db, "userStat"),
      where("userId", "==", userId),
      where("date", "==", date)
    );
    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
        return docSnap.docs[0].data() as UserStat;
    }
    return null;
}

export async function createUserStat(userId: string, date: Date, accomplishedGoal: boolean) {
  const userRef = addDoc(collection(db, "userStat"), {
    date: date,
    userId: userId,
    accomplishedGoal: accomplishedGoal
  });
}
