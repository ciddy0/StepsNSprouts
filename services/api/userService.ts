import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const userDoc = doc(db, "user", "USERID");
const docSnap = await getDoc(userDoc);

if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
} else {
  // docSnap.data() will be undefined in this case
  console.log("No such document!");
}