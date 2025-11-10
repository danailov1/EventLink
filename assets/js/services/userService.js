//userService.js

import { db } from "../config/firebaseConfig.js";
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { imageToBase64 } from "../utilis/base64.js";

export async function createUserProfile(uid, userData) {
  await setDoc(doc(db, "users", uid), userData);
}

export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUserProfile(uid, updates) {
  if (updates.avatarFile) {
    updates.avatar = await imageToBase64(updates.avatarFile);
    delete updates.avatarFile;
  }
  await updateDoc(doc(db, "users", uid), updates);
}