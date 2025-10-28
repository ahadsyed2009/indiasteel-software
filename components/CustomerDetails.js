// CustomerDetails.js
import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { OrderContext } from "./context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { ref, remove, set } from "firebase/database";
import { db, auth } from "../firebase";

// ---------------------- Helpers ----------------------
const n = (v) => (typeof v === "number" ? v : Number(v) || 0);

function computeOrderTotals(order) {
  const subTotal = (order.items || []).reduce((sum, it) => {
    const unitPrice = it.itemName === "Other" ? n(it.customPrice) : n(it.itemPrice);
    return sum + unitPrice * n(it.itemQty);
  }, 0);

  const transport = n(order.transport);

  const discountValue = (() => {
    if (!order.discount) return 0;
    return order.discountType === "%"
      ? ((subTotal + transport) * n(order.discount)) / 100
      : n(order.discount);
  })();

  const grandTotal = Math.max(subTotal + transport - discountValue, 0);
  return { subTotal, transport, discountValue, grandTotal };
}

// ---------------------- Component ----------------------
export default function CustomerDetails({ route, navigation }) {
  const { orders, setOrders } = useContext(OrderContext);
  const customerPhoneParam = route?.params?.customerPhone;

  // Filter orders for this customer
  const customerOrders = useMemo(() => {
    if (customerPhoneParam)
      return (orders || []).filter((o) => o.customerPhone === customerPhoneParam);
    return [];
  }, [orders, customerPhoneParam]);

  const primary = customerOrders[0] || null;

  // ---- Customer edit state ----
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // ---- Save edited customer ----
  const saveCustomerEdit = () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert("Error", "Name and phone cannot be empty.");
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.customerPhone === customerPhoneParam
          ? { ...o, customerName: editName, customerPhone: editPhone }
          : o
      )
    );
    setEditing(false);
  };

  // ---- Delete order ----
  const deleteOrder = (id) => {
    Alert.alert("Delete", "Delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const userId = auth.currentUser.uid;
          const orderRef = ref(db, `userOrders/${userId}/${id}`);
          remove(orderRef)
            .then(() => {
              setOrders((prev) => prev.filter((o) => o.id !== id));
            })
            .catch((error) => console.error("Error deleting order:", error));
        },
      },
    ]);
  };

  // ---- Update order status ----
  const setStatus = (id, status) => {
    const userId = auth.currentUser.uid;
    const orderRef = ref(db, `userOrders/${userId}/${id}`);
    const orderToUpdate = orders.find((o) => o.id === id);
    if (!orderToUpdate) return;
    set(orderRef, { ...orderToUpdate, status })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      })
      .catch((error) => console.error("Error updating status:", error));
  };

  // ---- Share PDF: per order ----
// ---- Share PDF: per order ----
const shareOrderPDF = async (order) => {
  const { subTotal, transport, discountValue, grandTotal } = computeOrderTotals(order);

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          p { margin: 6px 0; }
        </style>
      </head>
      <body>
        <h2>Order Receipt</h2>
        <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
        <p><strong>Date:</strong> ${new Date(order.createdAtMs || Date.now()).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status || "Pending"}</p>
        <hr/>
        <h3>Items</h3>
        <table>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          ${(order.items || []).map((it) => {
            const unitPrice = it.itemName === "Other" ? n(it.customPrice) : n(it.itemPrice);
            return `
              <tr>
                <td>${it.itemName === "Other" ? it.customName : it.itemName} ${it.brand ? `(${it.brand})` : ""}</td>
                <td>${it.itemQty}</td>
                <td>₹${unitPrice}</td>
                <td>₹${(n(it.itemQty) * unitPrice).toFixed(2)}</td>
              </tr>`;
          }).join("")}
        </table>
        <hr/>
        <p>Subtotal: ₹${subTotal.toFixed(2)}</p>
        <p>Transport: ₹${transport.toFixed(2)}</p>
        <p>Discount: ₹${discountValue.toFixed(2)} (${order.discount || 0}${order.discountType || ""})</p>
        <h3>Final: ₹${grandTotal.toFixed(2)}</h3>
        <p><strong>Payment:</strong> ${order.paymentMethod || "-"}</p>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    console.log("PDF created at:", uri);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Order PDF",
        UTI: "com.adobe.pdf",
      });
    } else {
      Alert.alert("Sharing not available", "Your device does not support file sharing.");
    }
  } catch (err) {
    console.error("PDF Error:", err);
    Alert.alert("Error", "Could not generate or share PDF");
  }
};


  if (!primary) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>No orders found for this customer.</Text>
      </View>
    );
  }

  const allTotals = customerOrders.reduce(
    (acc, order) => {
      const { subTotal, transport, discountValue, grandTotal } = computeOrderTotals(order);
      return {
        subtotal: acc.subtotal + subTotal,
        transport: acc.transport + transport,
        discount: acc.discount + discountValue,
        total: acc.total + grandTotal,
        beforeDiscount: acc.beforeDiscount + (subTotal + transport),
      };
    },
    { subtotal: 0, transport: 0, discount: 0, total: 0, beforeDiscount: 0 }
  );

  const customerObj = {
    id: primary.customerPhone,
    customerName: primary.customerName,
    customerPhone: primary.customerPhone,
    orders: customerOrders,
  };

  // ---------------------- Render ----------------------
  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(primary.customerName || "?").charAt(0).toUpperCase()}
            </Text>
          </View>

          {editing ? (
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Customer Name"
              />
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Customer Phone"
                keyboardType="phone-pad"
              />
              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveCustomerEdit}>
                  <Text style={{ color: "#fff" }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: "#aaa", marginLeft: 8 }]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{primary.customerName}</Text>
              <Text style={styles.subtitle}>{primary.customerPhone}</Text>
              
              {/* Show totals with discount breakdown */}
              <View style={{ marginTop: 6 }}>
                {allTotals.discount > 0 && (
                  <>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      Before Discount: ₹{allTotals.beforeDiscount.toFixed(2)}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: "600" }}>
                      Discount: -₹{allTotals.discount.toFixed(2)}
                    </Text>
                  </>
                )}
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#16a34a", marginTop: 2 }}>
                  Total: ₹{allTotals.total.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Header actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
            onPress={() => navigation.navigate("NewOrder", { customer: customerObj })}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#17a2b8" }]}
            onPress={() => Alert.alert("Feature Coming Soon", "Share all orders PDF")}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>

          {!editing && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
              onPress={() => {
                setEditName(primary.customerName);
                setEditPhone(primary.customerPhone);
                setEditing(true);
              }}
            >
              <Feather name="edit-3" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Orders list */}
      <FlatList
        data={[...customerOrders].sort(
          (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)
        )}
        keyExtractor={(it) => it.id.toString()}
        renderItem={({ item }) => {
          const { subTotal, transport, discountValue, grandTotal } =
            computeOrderTotals(item);
          const status = item.status || "Pending";

          return (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={{ fontWeight: "700" }}>
                  {new Date(item.createdAtMs || Date.now()).toLocaleString()}
                </Text>
                <Text style={{ fontWeight: "700" }}>₹{grandTotal.toFixed(2)}</Text>
              </View>

              {/* Status Chips */}
              <View style={styles.statusRow}>
                {["Pending", "In Progress", "Complete"].map((opt) => {
                  const active = status === opt;
                  const chipStyle =
                    opt === "Pending"
                      ? styles.chipPending
                      : opt === "In Progress"
                      ? styles.chipInProgress
                      : styles.chipComplete;
                  const textStyle =
                    opt === "Pending"
                      ? styles.chipTextPending
                      : opt === "In Progress"
                      ? styles.chipTextInProgress
                      : styles.chipTextComplete;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.statusChip, active && chipStyle]}
                      onPress={() => setStatus(item.id, opt)}
                    >
                      <Text style={[styles.statusChipText, active && textStyle]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Items */}
              <View style={{ marginTop: 8 }}>
                {(item.items || []).map((it, idx) => {
                  const unitPrice =
                    it.itemName === "Other" ? n(it.customPrice) : n(it.itemPrice);
                  return (
                    <View key={idx} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600" }}>
                          {it.itemName === "Other" ? it.customName : it.itemName}
                          {it.companyName ? ` (${it.companyName})` : ""}
                        </Text>
                        {it.diameter && (
                          <Text style={{ fontSize: 12, color: "#6b7280" }}>
                            Diameter: {it.diameter}
                          </Text>
                        )}
                      </View>
                      <Text style={{ width: 70 }}>x{it.itemQty}</Text>
                      <Text style={{ width: 90 }}>₹{unitPrice}</Text>
                      <Text style={{ width: 90 }}>
                        ₹{(n(it.itemQty) * unitPrice).toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Totals */}
              <View style={{ marginTop: 8 }}>
                <Text>Subtotal: ₹{subTotal.toFixed(2)}</Text>
                <Text>Transport: ₹{transport.toFixed(2)}</Text>
                {discountValue > 0 && (
                  <>
                    <Text style={{ color: "#6b7280" }}>
                      Before Discount: ₹{(subTotal + transport).toFixed(2)}
                    </Text>
                    <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                      Discount: -₹{discountValue.toFixed(2)} ({item.discount || 0}
                      {item.discountType || ""})
                    </Text>
                  </>
                )}
                <Text style={{ fontWeight: "700", fontSize: 15, marginTop: 4 }}>
                  Final: ₹{grandTotal.toFixed(2)}
                </Text>
                <Text>Payment: {item.paymentMethod || "-"}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: "#007bff" }]}
                  onPress={() => navigation.navigate("NewOrder", { orderToEdit: item })}
                >
                  <Feather name="edit-3" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: "#FF3B30" }]}
                  onPress={() => deleteOrder(item.id)}
                >
                  <MaterialIcons name="delete-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: "#17a2b8" }]}
                  onPress={() => shareOrderPDF(item)}
                >
                  <Ionicons name="share-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#555", marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  saveBtn: { backgroundColor: "#28a745", padding: 8, borderRadius: 6 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  orderCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between" },
  statusRow: { flexDirection: "row", marginTop: 8 },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  statusChipText: { color: "#555", fontWeight: "600", fontSize: 12 },
  chipPending: { backgroundColor: "#fff3cd" },
  chipTextPending: { color: "#7a5d00" },
  chipInProgress: { backgroundColor: "#ffe4c7" },
  chipTextInProgress: { color: "#a04b00" },
  chipComplete: { backgroundColor: "#d4edda" },
  chipTextComplete: { color: "#1a6632ff" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    flexWrap: "wrap",
  },
  iconBtn: { padding: 8, borderRadius: 6, marginLeft: 8 },
});