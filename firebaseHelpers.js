// firebaseHelpers.js
import { ref, set, onValue, query, orderByChild, equalTo, remove } from "firebase/database";
import { db, auth } from "./firebase";

export const saveUserOrder = (order) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return Promise.reject(new Error("Not authenticated"));

  const orderToSave = {
    ...order,
    userId,
  };

  const orderRef = ref(db, `orders/${order.id}`);
  const userIndexRef = ref(db, `users/${userId}/orders/${order.id}`);

  // write both the order and the per-user index
  return Promise.all([set(orderRef, orderToSave), set(userIndexRef, true)]);
};

export const deleteUserOrder = async (orderId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  await Promise.all([
    remove(ref(db, `orders/${orderId}`)),
    remove(ref(db, `users/${userId}/orders/${orderId}`)),
  ]);
};

// Fetch orders for current user (query top-level by userId)
export const fetchUserOrders = (setOrders) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const q = query(ref(db, `orders`), orderByChild("userId"), equalTo(userId));
  return onValue(q, (snapshot) => {
    const data = snapshot.val();
    setOrders(data ? Object.values(data) : []);
  });
};



