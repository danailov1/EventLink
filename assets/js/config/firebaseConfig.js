// firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXoV_L5EUKqpICJYBUtaDCpDGThaBjAvQ",
  authDomain: "chasove-1ea29.firebaseapp.com",
  projectId: "chasove-1ea29",
  storageBucket: "chasove-1ea29.firebasestorage.app",
  messagingSenderId: "164861073417",
  appId: "1:164861073417:web:d9db0104936cd3236a80d8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);