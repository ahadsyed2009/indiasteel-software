// components/OrderContext.js
import React, { createContext, useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
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

  // Prevent multiple listeners on hot reload
  const listenerSet = useRef(false);

  useEffect(() => {
    if (listenerSet.current) return; // already listening
    listenerSet.current = true;

    const ordersRef = ref(db, "/orders");

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      console.log("Firebase snapshot exists?", snapshot.exists());
      console.log("Firebase snapshot val:", snapshot.val());

      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        console.log("Orders list set:", ordersList);
        setOrders(ordersList);
      }
      // Do NOT clear orders if snapshot is empty to prevent flicker
    });

    return () => unsubscribe();
  }, []);
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
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
