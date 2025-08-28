// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
export { db };