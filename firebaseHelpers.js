// firebaseHelpers.js
import { ref, set, onValue } from "firebase/database";
import { db, auth } from "./firebase";

export const saveUserOrder = (order) => {
  const userId = auth.currentUser.uid;
  const path = `userOrders/${userId}/${order.id}`;

  // ✅ Ensure defaults
  const orderToSave = {
    ...order,
    customers: (order.customers || []).map((cust) => ({
      ...cust,
      discount: cust.discount || 0,
    })),
  };

  return set(ref(db, path), orderToSave);
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



