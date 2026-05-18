import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, goOnline } from "firebase/database";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCskrDuxMGkecDebJLtPR3tbdVRG9KwVD8",
  authDomain: "indiasteel-software.firebaseapp.com",
  projectId: "indiasteel-software",
  storageBucket: "indiasteel-software.firebasestorage.app",
  messagingSenderId: "288374665262",
  appId: "1:288374665262:web:cc2eae756ebc24a1466fbf",
  measurementId: "G-HRRGBM4045",
  databaseURL: "https://indiasteel-software-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// ← Prevent duplicate app initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getDatabase(app);
goOnline(db);

// ← Prevent duplicate auth initialization
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { app, db, auth };