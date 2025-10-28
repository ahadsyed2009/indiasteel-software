// components/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
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
  const [customers, setCustomers] = useState([]);
  // Companies default
  const [companies, setCompanies] = useState([]);

  const [Username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  // ✅ FIXED useEffect — handles empty orders correctly
  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }


    const userId = auth.currentUser.uid;
    const ordersRef = ref(db, `userOrders/${userId}`);

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const ordersList = Object.entries(data).map(([id, value]) => ({
            id,
            ...(typeof value === "object" ? value : { value }),
          }));
          setOrders(ordersList);
          console.log("Orders loaded:", ordersList);
        } else {
          console.log("No orders found for user:", userId);
          setOrders([]); // ✅ clear orders if none exist
        }
        setIsLoading(false); // ✅ always stop loading
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!userId) return;

    const companiesRef = ref(db, `userOrders/${userId}/companies`);

    const unsubscribe = onValue(
      companiesRef,
      (snapshot) => {
        const data = snapshot.val();
        const companiesArray = data ? Object.values(data) : [];
        setCompanies(companiesArray);
      },
      (error) => {
        console.error("Error fetching companies:", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);
  
   useEffect(() => {
    if (!userId) return;

    const customersRef = ref(db, `userOrders/${userId}/customers`);

    const unsubscribe = onValue(
      customersRef,
      (snapshot) => {
        const data = snapshot.val();
        const customersArray = data ? Object.values(data) : [];
        setCustomers(customersArray);
      },
      (error) => {
        console.error("Error fetching companies:", error);
      }
    );

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
        setIsLoading,
        customers,
        setCustomers,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};