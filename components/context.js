// components/context.js
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, get, query, orderByChild, equalTo } from "firebase/database";
import { auth, db } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders,    setOrders]    = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [steelPrice,  setSteelPrice]  = useState(650);
  const [cementPrice, setCementPrice] = useState(350);

  const [Username,   setUsername]  = useState("");
  const [isLoading,  setIsLoading] = useState(true);

  const [shopId,   setShopId]   = useState(null);
  const [shopName, setShopName] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userId,   setUserId]   = useState(null);
  const [members,  setMembers]  = useState([]);

  // ---------------------------------------------------------------------------
  // Step 1 — Auth listener: just get userId + shopId from users/{uid}
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoading(false);
        setOrders([]);
        setCompanies([]);
        setCustomers([]);
        setShopId(null);
        setShopName("");
        setUserRole(null);
        setUserId(null);
        setMembers([]);
        return;
      }

      try {
        setUserId(user.uid);
        const userSnap = await get(ref(db, `users/${user.uid}`));
        const userData = userSnap.val();

        if (userData?.shopId) {
          setShopId(userData.shopId);
          setUserRole(userData.role || "staff");
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setIsLoading(false);
      }
    });

    return () => unsubAuth();
  }, []); // ✅ run once only — no shopId dependency

  // ---------------------------------------------------------------------------
  // Step 2 — Data listeners: only run when shopId is known
  // ---------------------------------------------------------------------------
  
  
  useEffect(() => {
    if (!shopId) return;

    setIsLoading(true);

    // Shop name
    get(ref(db, `shops/${shopId}`)).then((snap) => {
      const data = snap.val();
      if (data?.shopName) setShopName(data.shopName);
    });

    // ✅ orders
    const unsubOrders = onValue(
      query(ref(db, "orders"), orderByChild("shopId"), equalTo(shopId)),
      (snap) => {
        const data = snap.val();
        console.log("orders snap:", data); // debug
        setOrders(data ? Object.values(data) : []);
      },
      (err) => console.error("orders error:", err)
    );

    // ✅ companies
    const unsubCompanies = onValue(
      query(ref(db, "companies"), orderByChild("shopId"), equalTo(shopId)),
      (snap) => {
        const data = snap.val();
        console.log("companies snap:", data); // debug
        setCompanies(data ? Object.values(data) : []);
      },
      (err) => console.error("companies error:", err)
    );

    // ✅ customers
    const unsubCustomers = onValue(
      query(ref(db, "customers"), orderByChild("shopId"), equalTo(shopId)),
      (snap) => {
        const data = snap.val();
        console.log("customers snap:", data); // debug
        setCustomers(data ? Object.values(data) : []);
      },
      (err) => console.error("customers error:", err)
    );

    // ✅ members
    const unsubMembers = onValue(
      ref(db, `shops/${shopId}/members`),
      (snap) => {
        const data = snap.val();
        setMembers(data
          ? Object.entries(data).map(([uid, val]) => ({ uid, ...val }))
          : []
        );
      },
      (err) => console.error("members error:", err)
    );

    setIsLoading(false);

    return () => {
      unsubOrders();
      unsubCompanies();
      unsubCustomers();
      unsubMembers();
    };
  }, [shopId]); // ✅ re-runs whenever shopId changes

  // ---------------------------------------------------------------------------
  // Username persistence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    AsyncStorage.getItem("Username").then((saved) => {
      if (saved) setUsername(saved);
    });
  }, []);

  const handleSetUsername = async (value) => {
    setUsername(value);
    await AsyncStorage.setItem("Username", value).catch(console.error);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,    setOrders,
        customers, setCustomers,
        companies, setCompanies,
        steelPrice,  setSteelPrice,
        cementPrice, setCementPrice,
        Username, setUsername: handleSetUsername,
        isLoading,
        shopId,   setShopId,
        shopName, setShopName,
        userRole, setUserRole,
        userId,
        members,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};