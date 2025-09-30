// components/OrderContext.js
import React, { createContext, useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { auth } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Price states
  const [steelPrice, setSteelPrice] = useState(650);
  const [cementPrice, setCementPrice] = useState(350);

  // Companies default
  const [companies, setCompanies] = useState([
]);

  const [Username, setUsername] = useState("");
  const [isLoading,setIsLoading] = useState(true);
  // Prevent multiple listeners on hot reload
  const userId = auth.currentUser?.uid;

  useEffect(() => {
  if (!auth.currentUser) return; // wait until logged in

  const userId = auth.currentUser.uid;
  const ordersRef = ref(db, `userOrders/${userId}`);

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ordersList = Object.entries(data).map(([id, value]) => ({
        id,
        ...(typeof value === "object" ? value : { value }),
      }));
      setOrders(ordersList);
      console.log("Orders loaded:", ordersList);
      setIsLoading(false);
    } else {
      console.log("No orders found for user:", userId);
    }
  });

  return () => unsubscribe();
}, []);
 useEffect(() => {
  if (!userId) return;

  const companiesRef = ref(db, `userOrders/${userId}/companies`);
  
  // Listen for changes in Firebase
  const unsubscribe = onValue(companiesRef, (snapshot) => {
    const data = snapshot.val();
    const companiesArray = data ? Object.values(data) : [];
    setCompanies(companiesArray);
  }, (error) => {
    console.error("Error fetching companies:", error);
  });

  // Cleanup listener on unmount
  return () => unsubscribe();
}, [userId]);

     useEffect(() => {
    const loadUsername = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("Username");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (e) {
        console.log("Error loading username:", e);
      }
    };
    loadUsername();
  }, []);

  // --- Save username whenever it changes ---
  const handleSetUsername = async (value) => {
    setUsername(value);
    try {
      await AsyncStorage.setItem("Username", value);
    } catch (e) {
      console.log("Error saving username:", e);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        steelPrice,
        setSteelPrice,
        cementPrice,
        setCementPrice,
        companies,
        setCompanies,
        Username,
        setUsername: handleSetUsername,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};