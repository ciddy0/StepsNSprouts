// services/firebase/userProfile.ts
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

export type UserProfile = {
  email?: string;
  firstName?: string;
  lastName?: string;
  stepGoal?: number;
  createdAt?: any;
  updatedAt?: any;
  weight?: number | null; // in lbs null if not set
  height?: number | null; // in ft null if not set
  age?: number | null; // in years null if not set
};



// Create a reference for a given user document
export const userProfileRef = (uid: string) => doc(db, "users", uid);

/**
 * Ensure a user profile exists in Firestore.
 * If it doesn't, create one with the given initial data.
 */
export async function ensureUserProfile(
  uid: string,
  initialData: Partial<UserProfile> = {}
) {
  const ref = userProfileRef(uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: initialData.email ?? null,
      firstName: initialData.firstName ?? null,
      lastName: initialData.lastName ?? null,
      stepGoal: initialData.stepGoal ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      weight: initialData.weight ?? null,
      height: initialData.height ?? null,
      age: initialData.age ?? null,
    });
  }
}

/**
 * Fetch a user's profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = userProfileRef(uid);
  const snap = await getDoc(ref);


  if (!snap.exists()) return null;

  const data = snap.data() as UserProfile;

  if (data.weight === undefined) data.weight = null;
  if (data.height === undefined) data.height = null;
  if (data.age === undefined) data.age = null;

  return data;
}

/**
 * Update a user's profile in Firestore.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  const ref = userProfileRef(uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
