//authService.js

import { auth } from "../config/firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { isValidEmail, isValidPassword } from "../utilis/validation.js";

export async function registerUser(email, password, confirmPassword) {
  if (!isValidEmail(email)) throw new Error("Invalid email");
  if (!isValidPassword(password)) throw new Error("Password must be at least 6 characters");
  if (password !== confirmPassword) throw new Error("Passwords do not match");
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email, password) {
  if (!isValidEmail(email)) throw new Error("Invalid email");
  if (!isValidPassword(password)) throw new Error("Password must be at least 6 characters");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  await signOut(auth);
}