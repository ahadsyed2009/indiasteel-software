import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth } from "./firebase";

// Register new user
export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Login existing user
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Logout
export const logoutUser = () => signOut(auth);
