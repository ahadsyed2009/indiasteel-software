// components/OrderContext.js
import React, { createContext, useState, useEffect, use } from "react";
import { db } from "../firebase";
import { ref,onValue} from "firebase/database";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Existing single price values
  const [steelPrice, setSteelPrice] = useState(650);
  const [cementPrice, setCementPrice] = useState(350);

  // ✅ Default company so companies.map never crashes
  const [companies, setCompanies] = useState([
    { name: "Default", steelPrice: 0, steelUnit: 0, cementPrice: 0, cementUnit: 0 },
  ]);

useEffect(() => {
  const ordersRef = ref(db, "/orders");

  const unsubscribe = onValue(ordersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();

      const ordersList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setOrders(ordersList);
    } else {
      setOrders([]);
    }
  });

  return () => unsubscribe();
}, []);

const [Username, setUsername] = useState("");

  

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
      setUsername,
      
      }}>
      {children}
    </OrderContext.Provider>
  );
};