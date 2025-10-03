import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User } from "../firebase/collections/user";
import { db } from "../firebase/config";

/**
 * get user document
 */ 

const userDoc = doc(db, "user", "USERID");
const docSnap = await getDoc(userDoc);

if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}

/**
 * update user document
 */ 

async function updateUser(user: User) {
// retrieve user reference
const userRef = doc(db, user.id);
  await updateDoc(userRef, {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.password,
    stepGoal: user.stepGoal,
    pomes: user.pomes, // currency
    profilePicture: user.profilePicture // base 64
  })
}