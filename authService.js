import { 

  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth, db } from "./firebase";
import { ref, set } from "firebase/database";

// Register new user


// Login existing user
export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);


// Logout
export const logoutUser = () => signOut(auth);

// NOTE: shop type management removed - handle user profiles elsewhere if needed

