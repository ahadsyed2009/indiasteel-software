// firebaseHelpers.js
import { ref, set, onValue } from "firebase/database";
import { db, auth } from "./firebase"; // correct path

// Save a new order or update existing
export const saveUserOrder = (order) => {
  const userId = auth.currentUser.uid;
  const path = `userOrders/${userId}/${order.id}`;
  return set(ref(db, path), order);
};

// Fetch all orders for the current userr
export const fetchUserOrders = (setOrders) => {
  const userId = auth.currentUser.uid;
  const ordersRef = ref(db, `userOrders/${userId}`);
  onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    setOrders(data ? Object.values(data) : []);
  });
};



