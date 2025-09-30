// components/NewOrder.js
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { OrderContext } from "./context";
import { Picker } from "@react-native-picker/picker";
import { saveUserOrder } from "../firebaseHelpers";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const lineTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (items) => (items || []).reduce((s, it) => s + lineTotal(it), 0);

const paymentOptions = ["Cash", "Credit", "UPI"];

export default function NewOrder({ navigation, route }) {
  const { orders, setOrders, companies = [] } = useContext(OrderContext);

  const routeCustomer = route?.params?.customer;
  const orderToEdit = route?.params?.orderToEdit;

  const [customerName, setCustomerName] = useState(
    orderToEdit?.customerName || routeCustomer?.customerName || ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    orderToEdit?.customerPhone || routeCustomer?.customerPhone || ""
  );
  const [place, setPlace] = useState(
    orderToEdit?.place || ""
  );
  const [driverName, setDriverName] = useState(
    orderToEdit?.driverName || ""
  );

  const [transport, setTransport] = useState(
    orderToEdit?.transport ? String(orderToEdit.transport) : ""
  );
  const [paymentMethod, setPaymentMethod] = useState(orderToEdit?.paymentMethod || "");
  const [items, setItems] = useState(
    orderToEdit?.items?.length ? orderToEdit.items.map((i) => ({ ...i })) : []
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemCompany, setCurrentItemCompany] = useState(
    (companies && companies[0]?.name) || ""
  );

  const [showCustomer,setShowCustomer] = useState(false);

  useEffect(() => {
  if (routeCustomer) {
    // Find the most recent order for this customer
    const customerOrders = (orders || [])
      .filter(o => o.customerPhone === routeCustomer.customerPhone)
      .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

    const lastOrder = customerOrders[0];

    // Set customer details
    setCustomerName(routeCustomer.customerName || "");
    setCustomerPhone(routeCustomer.customerPhone || "");
    
    // Pre-fill last used details if available
    if (lastOrder) {
      setPlace(lastOrder.place || "");
      setTransport(lastOrder.transport ? String(lastOrder.transport) : "");
      setDriverName(lastOrder.driverName || "");
      setPaymentMethod(lastOrder.paymentMethod || "");
    }

    // Show customer section automatically
    setShowCustomer(false);
  }
}, [routeCustomer, orders]);
  useEffect(() => {
    if (routeCustomer) {
      setCustomerName(routeCustomer.customerName || "");
      setCustomerPhone(routeCustomer.customerPhone || "");
    }
  }, [routeCustomer]);

  const handleNameChange = (t) => {
    setCustomerName(t);
    const existing = (orders || []).find(
      (o) => (o.customerName || "").toLowerCase() === t.toLowerCase()
    );
    if (existing) setCustomerPhone(existing.customerPhone);
  };
  const handlePhoneChange = (t) => {
    setCustomerPhone(t);
    const existing = (orders || []).find((o) => o.customerPhone === t);
    if (existing) setCustomerName(existing.customerName);
  };

  const openNewItem = () => {
    setCurrentItem({
      id: Date.now().toString(),
      itemName: "",
      itemQty: "",
      itemPrice: "",
      companyName: (companies && companies[0]?.name) || "",
    });
    setCurrentItemCompany((companies && companies[0]?.name) || "");
    setModalVisible(true);
  };

  const openEditItem = (item) => {
    const base = { ...item, itemPrice: n(item.itemPrice), itemQty: n(item.itemQty) };
    setCurrentItem(base);
    setCurrentItemCompany(item.companyName || (companies && companies[0]?.name) || "");
    setModalVisible(true);
  };

  const calculateUnitPrice = (item, companyName) => {
    if (!item) return 0;
    const name = (item.itemName || "").toLowerCase();

    if (name === "other") return n(item.customPrice);

    // Find company
    const company = companies?.find((c) => c.name === companyName);

    if (company) {
      // ✅ Steel pricing
      if (name.includes("steel")) {
        const unit = company.steelUnit && company.steelUnit > 0 ? company.steelUnit : 1;
        return (company.steelPrice && company.steelPrice > 0 ? company.steelPrice : 650) / unit;
      }

      // ✅ Cement pricing
      if (name.includes("cement")) {
        const unit = company.cementUnit && company.cementUnit > 0 ? company.cementUnit : 1;
        return (company.cementPrice && company.cementPrice > 0 ? company.cementPrice : 350) / unit;
      }
    }

    // Default fallback if company not found
    if (name.includes("steel")) return 650 / 1000;
    if (name.includes("cement")) return 350 / 1;

    return n(item.itemPrice);
  };

  const saveItem = () => {
    if (!currentItem || !currentItem.itemName || !currentItem.itemQty || !currentItemCompany) {
      return Alert.alert("Error", "Fill all item details");
    }

    if ((currentItem.itemName || "").toLowerCase() === "other") {
      if (!currentItem.customName || !currentItem.customPrice) {
        return Alert.alert("Error", "Enter custom item name and price");
      }
    }

    const qty = n(currentItem.itemQty);
    const unitPrice =
      (currentItem.itemName || "").toLowerCase() === "other"
        ? n(currentItem.customPrice)
        : calculateUnitPrice(currentItem, currentItemCompany);

    const itemToSave = {
      ...currentItem,
      itemQty: qty,
      itemPrice: unitPrice,
      companyName: currentItemCompany,
      ...(currentItem.itemName === "Other" || (currentItem.itemName || "").toLowerCase() === "other"
        ? { customName: currentItem.customName, customPrice: n(currentItem.customPrice) }
        : {}),
    };

    setItems((prev) => {
      const exists = prev.find((it) => it.id === itemToSave.id);
      if (exists) {
        return prev.map((it) => (it.id === itemToSave.id ? itemToSave : it));
      }
      return [...prev, itemToSave];
    });

    setModalVisible(false);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const submit = () => {
    if (!customerName || !customerPhone)
      return Alert.alert("Error", "Enter customer name & phone");
    if (!paymentMethod) return Alert.alert("Error", "Select payment method");
    if (!place) return Alert.alert("Error", "Enter delivery place");
    if (!items.length) return Alert.alert("Error", "Add at least one item");

    const subtotal = orderTotal(items);
    const transportCost = n(transport);
    const finalTotal = subtotal + transportCost;

    if (orderToEdit) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToEdit.id
            ? {
                ...o,
                customerName,
                customerPhone,
                items,
                place,
                driverName,
                paymentMethod,
                transport: transportCost,
                subtotal,
                finalTotal,
                createdAtMs: o.createdAtMs || Date.now(),
                status: o.status,
              }
            : o
        )
      );
      saveUserOrder({
        ...orderToEdit,
        customerName,
        customerPhone,
        items,
        place,
        driverName,
        paymentMethod,
        transport: transportCost,
        subtotal,
        finalTotal,
        createdAtMs: orderToEdit.createdAtMs || Date.now(),
        status: orderToEdit.status,
      }).catch((err) => Alert.alert("Firebase Error", err.message));
    } else {
      const newOrder = {
        id: Date.now().toString(),
        customerName,
        customerPhone,
        items,
        place,
        driverName,
        paymentMethod,
        transport: transportCost,
        subtotal,
        finalTotal,
        createdAtMs: Date.now(),
        status: "Pending",
      };

      setOrders((prev) => [...prev, newOrder]);
      saveUserOrder(newOrder).catch((err) => Alert.alert("Firebase Error", err.message));
    }
    navigation.goBack();
  };

  const formatMoney = (v) => {
    const num = Number(v) || 0;
    return num.toFixed(2);
  };

  return (
  <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1, }}
    keyboardVerticalOffset={90}
  >
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Customer / Order</Text>
      <ScrollView style={{ maxHeight: 250 }}>
  {items.map((it) => {
    const displayName =
      it.itemName === "Other"
        ? `Other: ${it.customName || "Unnamed"} (${it.companyName || "No Company"})`
        : `${it.itemName} (${it.companyName || "No Company"})`;

    const price =
      it.itemName === "Other"
        ? Number(it.customPrice || it.itemPrice || 0)
        : lineTotal(it) / it.itemQty;

    const total = price * it.itemQty;

    return (
      <View key={it.id} style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.itemName}>{displayName}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.detail}>Qty: {it.itemQty}</Text>
          <Text style={styles.detail}>Price: ₹{formatMoney(price)}</Text>
          <Text style={styles.total}>Total: ₹{formatMoney(total)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEditItem(it)} style={styles.editBtn}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(it.id)} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  })}
</ScrollView>


     

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#6c5ce7", marginTop: 10, marginBottom: 15 }]}
        onPress={openNewItem}
      >
        <Text style={styles.btnText}>+ Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#6c5ce7", marginTop: 10, marginBottom: 15 }]}
        onPress={()=>setShowCustomer(!showCustomer) }
      >
        <Text style={styles.btnText}>{showCustomer ? 'Hide Customer':'Show Customer'}</Text>
      </TouchableOpacity>
{showCustomer&&(
  <>
      <TextInput
        placeholder="Customer Name"
        style={styles.input}
        value={customerName}
        onChangeText={handleNameChange}
      />
      <TextInput
        placeholder="Customer Phone"
        style={styles.input}
        value={customerPhone}
        onChangeText={handlePhoneChange}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Delivery Place"
        style={styles.input}
        value={place}
        onChangeText={setPlace}
      />
      <TextInput
        placeholder="Transport (₹)"
        style={styles.input}
        value={transport}
        onChangeText={setTransport}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Driver Name"
        style={styles.input}
        value={driverName}
        onChangeText={setDriverName}
      />

      <View style={styles.dropdown}>
        <Picker selectedValue={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
          <Picker.Item label="Select Payment Method" value="" />
          {paymentOptions.map((p) => (
            <Picker.Item key={p} label={p} value={p} />
          ))}
        </Picker>
      </View>
      </>
      )}
           <View style={styles.totals}>
        <Text>Order Total: ₹{orderTotal(items).toFixed(2)}</Text>
        <Text>Transport: ₹{n(transport).toFixed(2)}</Text>
        <Text style={{ fontWeight: "700" }}>
          Final Total: ₹{(orderTotal(items) + n(transport)).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity style={[styles.btn, { marginTop: 12 , marginBottom:30,}]} onPress={submit}>
        <Text style={styles.btnText}>{orderToEdit ? "Update Order" : "Save Order"}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="none" transparent>
         <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 40}
  >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.itemHeader}>Item Details</Text>

            <View style={styles.dropdown}>
              <Picker
                selectedValue={currentItem?.itemName}
                onValueChange={(v) => setCurrentItem((c) => ({ ...c, itemName: v }))}
              >
                <Picker.Item label="Select Item" value="" />
                <Picker.Item label="Steel" value="Steel" />
                <Picker.Item label="Cement" value="Cement" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            {currentItem && currentItem.itemName !== "Other" && (
  <View style={styles.dropdown}>
    <Picker
      selectedValue={currentItemCompany}
      onValueChange={(v) => setCurrentItemCompany(v)}
    >
      <Picker.Item label="Select Company" value="" />
      {(companies || [])
        .filter((company) => {
          if (!currentItem?.itemName) return false;
          
          if (currentItem.itemName.toLowerCase() === "steel") {
            // Only show companies that have steel prices
            return company.steelPrice && company.steelPrice > 0;
          }
          
          if (currentItem.itemName.toLowerCase() === "cement") {
            // Only show companies that have cement prices
            return company.cementPrice && company.cementPrice > 0;
          }
          
          return false; // Don't show companies for other items
        })
        .map((company) => (
          <Picker.Item key={company.name} label={company.name} value={company.name} />
        ))}
    </Picker>
  </View>
)}
            {currentItem?.itemName === "Other" && (
              <>
                <TextInput
                  placeholder="Enter Item Name"
                  style={styles.input}
                  value={currentItem?.customName || ""}
                  onChangeText={(t) => setCurrentItem((c) => ({ ...c, customName: t }))}
                />
                <TextInput
                  placeholder="Enter Price"
                  keyboardType="numeric"
                  style={styles.input}
                  value={String(currentItem?.customPrice ?? "")}
                  onChangeText={(t) => setCurrentItem((c) => ({ ...c, customPrice: t }))}
                />
              </>
            )}

            <TextInput
              placeholder="Qty"
              style={styles.input}
              keyboardType="numeric"
              value={String(currentItem?.itemQty || "")}
              onChangeText={(t) => setCurrentItem((c) => ({ ...c, itemQty: t }))}
            />

           

            <Text style={{ marginVertical: 6 }}>
              Line Total: ₹
              {currentItem
                ? formatMoney(
                    n(currentItem.itemQty) * calculateUnitPrice(currentItem, currentItemCompany)
                  )
                : "0.00"}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, marginRight: 5 }]} onPress={saveItem}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#d63031", flex: 1, marginLeft: 5 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    marginVertical: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginVertical: 4,
  },
  itemHeader: { fontWeight: "700", marginBottom: 6, fontSize: 16 },
  totals: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  btn: { backgroundColor: "#0984e3", padding: 12, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 8, padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  total: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a73e8",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e8f0fe",
    borderRadius: 6,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fdecea",
    borderRadius: 6,
  },
  editText: {
    color: "#1a73e8",
    fontWeight: "500",
  },
  deleteText: {
    color: "#d93025",
    fontWeight: "500",
  },
});