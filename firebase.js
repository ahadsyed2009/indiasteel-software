import { initializeApp,getApps  } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Your Firebase config
const firebaseConfig = {
apiKey: "AIzaSyCskrDuxMGkecDebJLtPR3tbdVRG9KwVD8",
authDomain: "indiasteel-software.firebaseapp.com",
projectId: "indiasteel-software",
storageBucket: "indiasteel-software.firebasestorage.app",
messagingSenderId: "288374665262",
appId: "1:288374665262:web:cc2eae756ebc24a1466fbf",
measurementId: "G-HRRGBM4045",
databaseURL: "https://indiasteel-software-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];


// Initialize Realtime Database
const db = getDatabase(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
persistence: getReactNativePersistence(AsyncStorage),
});

export { app, db, auth };