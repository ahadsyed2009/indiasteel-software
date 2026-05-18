// firebaseHelpers.js
import { ref, set, onValue, query, orderByChild, equalTo, remove } from "firebase/database";
import { db, auth } from "./firebase";

// ---------------------------------------------------------------------------
// Refs
// ---------------------------------------------------------------------------
const orderRef       = (orderId)    => ref(db, `orders/${orderId}`);
const ordersRef      = ()           => ref(db, `orders`);
const companyRef     = (companyId)  => ref(db, `companies/${companyId}`);
const companiesRef   = ()           => ref(db, `companies`);
const customerRef    = (customerId) => ref(db, `customers/${customerId}`);
const customersRef   = ()           => ref(db, `customers`);
const userOrderIndex = (userId, orderId) => ref(db, `users/${userId}/orders/${orderId}`);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const saveUserOrder = (order, shopId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return Promise.reject(new Error("Not authenticated"));
  if (!shopId) return Promise.reject(new Error("No shop selected"));

  const orderToSave = { ...order, userId, shopId };

  return Promise.all([
    set(orderRef(order.id), orderToSave),
    set(userOrderIndex(userId, order.id), true),
  ]);
};

export const deleteUserOrder = async (orderId) => {
  const userId = auth.currentUser?.uid;
  if (!userId)  throw new Error("Not authenticated");
  if (!orderId) throw new Error("Missing order id");

  await Promise.all([
    remove(orderRef(orderId)),
    remove(userOrderIndex(userId, orderId)),
  ]);
};

// Live listener — returns unsubscribe fn
export const fetchUserOrders = (setOrders, shopId) => {
  if (!shopId) return;
  const q = query(ordersRef(), orderByChild("shopId"), equalTo(shopId));
  return onValue(q, (snap) => {
    setOrders(snap.val() ? Object.values(snap.val()) : []);
  });
};

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export const saveCompany = (company) => {
  if (!company?.id)     return Promise.reject(new Error("Missing company id"));
  if (!company?.shopId) return Promise.reject(new Error("Missing shopId"));
  if (!company?.userId) return Promise.reject(new Error("Missing userId"));

  return set(companyRef(company.id), company);
};

export const deleteCompany = (company) => {
  const userId = auth.currentUser?.uid;
  if (!userId)      return Promise.reject(new Error("Not authenticated"));
  if (!company?.id) return Promise.reject(new Error("Missing company id"));

  return remove(companyRef(company.id));
};

// Live listener — returns unsubscribe fn
export const fetchCompanies = (setCompanies, shopId) => {
  if (!shopId) return;
  const q = query(companiesRef(), orderByChild("shopId"), equalTo(shopId));
  return onValue(q, (snap) => {
    setCompanies(snap.val() ? Object.values(snap.val()) : []);
  });
};

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

// ✅ FIXED: userId is NOT required — customers belong to the shop,
//    so any staff member of that shop can create/read them.
//    We still store createdBy for auditing but don't enforce it.
export const saveCustomer = (customer) => {
  if (!customer?.id)     return Promise.reject(new Error("Missing customer id"));
  if (!customer?.shopId) return Promise.reject(new Error("Missing shopId"));
  // ❌ REMOVED: userId check — was causing "Missing userId" error
  //    and preventing staff B from saving customers created by staff A

  return set(customerRef(customer.id), customer);
};

export const deleteCustomer = (customerId) => {
  const userId = auth.currentUser?.uid;
  if (!userId)     return Promise.reject(new Error("Not authenticated"));
  if (!customerId) return Promise.reject(new Error("Missing customer id"));

  return remove(customerRef(customerId));
};

// Live listener — returns unsubscribe fn
// ✅ Already correct — queries by shopId so ALL staff see the same customers
export const fetchCustomers = (setCustomers, shopId) => {
  if (!shopId) return;
  const q = query(customersRef(), orderByChild("shopId"), equalTo(shopId));
  return onValue(q, (snap) => {
    setCustomers(snap.val() ? Object.values(snap.val()) : []);
  });
};