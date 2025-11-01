// components/OrderContext.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { auth, db } from "../firebase";
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

  // ✅ FIXED useEffect — handles empty orders correctly
  useEffect(() => {
    let unsubOrders = null, unsubCompanies = null, unsubCustomers = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // cleanup previous listeners
      if (unsubOrders) { unsubOrders(); unsubOrders = null; }
      if (unsubCompanies) { unsubCompanies(); unsubCompanies = null; }
      if (unsubCustomers) { unsubCustomers(); unsubCustomers = null; }

      if (!user) {
        setIsLoading(false);
        setOrders([]); setCompanies([]); setCustomers([]);
        return;
      }

      const userId = user.uid;
      console.log("Auth ready, uid:", userId);

      unsubOrders = onValue(
        query(ref(db, "orders"), orderByChild("userId"), equalTo(userId)),
        (snap) => {
          console.log("orders snapshot:", snap.val());
          setOrders(snap.val() ? Object.values(snap.val()) : []);
        },
        (err) => console.error("orders onValue error:", err)
      );

      unsubCompanies = onValue(
        query(ref(db, "companies"), orderByChild("userId"), equalTo(userId)),
        (snap) => {
          console.log("companies snapshot:", snap.val());
          setCompanies(snap.val() ? Object.values(snap.val()) : []);
        }
      );

      unsubCustomers = onValue(
        query(ref(db, "customers"), orderByChild("userId"), equalTo(userId)),
        (snap) => {
          console.log("customers snapshot:", snap.val());
          setCustomers(snap.val() ? Object.values(snap.val()) : []);
        }
      );

      setIsLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
      if (unsubCompanies) unsubCompanies();
      if (unsubCustomers) unsubCustomers();
    };
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