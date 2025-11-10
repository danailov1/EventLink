//eventService.js

import { db } from "../config/firebaseConfig.js";
import { collection, addDoc, getDocs, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { imageToBase64 } from "../utilis/base64.js";

export async function createEvent(eventData) {
  if (eventData.imageFile) {
    eventData.image = await imageToBase64(eventData.imageFile);
    delete eventData.imageFile;
  }
  return await addDoc(collection(db, "events"), eventData);
}

export async function getAllEvents() {
  const q = query(collection(db, "events"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}