// assets/js/services/eventService.js
import { db } from "../config/firebaseConfig.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { imageToBase64 } from "../utilis/base64.js";

export async function createEvent(eventData) {
  // Handle image conversion if file exists
  if (eventData.imageFile) {
    eventData.image = await imageToBase64(eventData.imageFile);
  }
  
  // Remove imageFile property to avoid storing undefined in Firestore
  delete eventData.imageFile;
  
  // Initialize hype fields
  eventData.hypeCount = 0;
  eventData.hypedBy = [];
  eventData.createdAt = new Date().toISOString();
  
  return await addDoc(collection(db, "events"), eventData);
}

export async function getAllEvents() {
  const q = query(collection(db, "events"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Toggle hype status for an event
 * @param {string} eventId - Event document ID
 * @param {string} userId - User ID who is hyping
 * @returns {Promise<{hyped: boolean, newCount: number}>}
 */
export async function toggleHypeEvent(eventId, userId) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  
  if (!eventSnap.exists()) {
    throw new Error("Event not found");
  }
  
  const eventData = eventSnap.data();
  const hypedBy = eventData.hypedBy || [];
  const isCurrentlyHyped = hypedBy.includes(userId);
  
  if (isCurrentlyHyped) {
    // Remove hype
    await updateDoc(eventRef, {
      hypedBy: arrayRemove(userId),
      hypeCount: increment(-1)
    });
    
    return {
      hyped: false,
      newCount: Math.max(0, (eventData.hypeCount || 0) - 1)
    };
  } else {
    // Add hype
    await updateDoc(eventRef, {
      hypedBy: arrayUnion(userId),
      hypeCount: increment(1)
    });
    
    return {
      hyped: true,
      newCount: (eventData.hypeCount || 0) + 1
    };
  }
}

/**
 * Check if user has hyped an event
 * @param {string} eventId - Event document ID
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function checkIfUserHyped(eventId, userId) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  
  if (!eventSnap.exists()) {
    return false;
  }
  
  const eventData = eventSnap.data();
  const hypedBy = eventData.hypedBy || [];
  return hypedBy.includes(userId);
}

/**
 * Get events sorted by hype count
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>}
 */
export async function getTrendingEvents(limit = 10) {
  const events = await getAllEvents();
  return events
    .sort((a, b) => (b.hypeCount || 0) - (a.hypeCount || 0))
    .slice(0, limit);
}