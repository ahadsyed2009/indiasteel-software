// components/Step1.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const lineTotal = (it) => n(it.itemQty) * n(it.itemPrice);

export default function Step1({ items = [], setItems, companies = [], onNext }) {
  const [newItem, setNewItem] = useState({
    itemName: "",
    itemQty: "",
    customName: "",
    customPrice: "",
  });
  const [newItemCompany, setNewItemCompany] = useState("");
  const [newItemDiameter, setNewItemDiameter] = useState(""); // for steel
  const [step1Error, setStep1Error] = useState("");

  const calculateUnitPrice = (item, companyName, diameter) => {
    const company = companies.find((c) => c.name === companyName);
    if (!company) return 0;

    const name = (item.itemName || "").toLowerCase();

    if (name === "steel") {
      const steel = company.steelDetails?.find((s) => s.diameter === diameter);
      return steel ? n(steel.price) / n(steel.qty) : 650; // fallback
    }

    if (name === "cement") {
      return n(company.cementPrice) / n(company.cementQty || 1);
    }

    return n(item.customPrice);
  };

  const addNewItem = () => {
    if (!newItem.itemName || !newItem.itemQty) return Alert.alert("Error", "Fill item details");
    if (newItem.itemName !== "Other" && !newItemCompany) return Alert.alert("Error", "Select company");
    if (newItem.itemName === "Steel" && !newItemDiameter) return Alert.alert("Error", "Select steel diameter");

    const unitPrice =
      newItem.itemName === "Other"
        ? n(newItem.customPrice)
        : calculateUnitPrice(newItem, newItemCompany, newItemDiameter);

    const itemToSave = {
      id: Date.now().toString(),
      ...newItem,
      diameter: newItemDiameter || "",
      itemQty: n(newItem.itemQty),
      itemPrice: unitPrice,
      companyName: newItemCompany,
    };

    setItems((prev) => [...prev, itemToSave]);
    setNewItem({ itemName: "", itemQty: "", customName: "", customPrice: "" });
    setNewItemCompany("");
    setNewItemDiameter("");
    setStep1Error("");
  };

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const handleNext = () => {
    if (!items || items.length === 0) {
      setStep1Error("Add at least one item before proceeding!");
      return;
    }
    setStep1Error("");
    if (onNext) onNext();
  };

  const formatMoney = (v) => (Number(v) || 0).toFixed(2);

  return (
    <ScrollView style={styles.stepContent}>
      {step1Error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{step1Error}</Text>
        </View>
      ) : null}

      <View style={styles.addItemCard}>
        <Text style={styles.cardTitle}>Add Item</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Item Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newItem.itemName}
              onValueChange={(v) => setNewItem((c) => ({ ...c, itemName: v }))}
              style={styles.picker}
            >
              <Picker.Item label="Select Item Type" value="" />
              <Picker.Item label="Steel" value="Steel" />
              <Picker.Item label="Cement" value="Cement" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        {/* Company Picker for Steel/Cement */}
        {newItem.itemName && newItem.itemName !== "Other" && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newItemCompany}
                onValueChange={setNewItemCompany}
                style={styles.picker}
              >
                <Picker.Item label="Select Company" value="" />
                {(companies || [])
                  .filter((c) => {
                    if (newItem.itemName === "Steel") return c.steelDetails?.length > 0;
                    if (newItem.itemName === "Cement") return c.cementPrice > 0;
                    return false;
                  })
                  .map((c) => (
                    <Picker.Item key={c.name} label={c.name} value={c.name} />
                  ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Steel Diameter Picker */}
        {newItem.itemName === "Steel" && newItemCompany && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Steel Diameter</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newItemDiameter}
                onValueChange={setNewItemDiameter}
                style={styles.picker}
              >
                <Picker.Item label="Select Diameter" value="" />
                {(companies.find((c) => c.name === newItemCompany)?.steelDetails || []).map((s) => (
                  <Picker.Item
                    key={s.diameter}
                    label={`${s.diameter} - ₹${s.price}`}
                    value={s.diameter}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Custom Item */}
        {newItem.itemName === "Other" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                placeholder="Enter item name"
                style={styles.textInput}
                value={newItem.customName}
                onChangeText={(t) => setNewItem((c) => ({ ...c, customName: t }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price per Unit</Text>
              <TextInput
                placeholder="Enter price"
                keyboardType="numeric"
                style={styles.textInput}
                value={newItem.customPrice}
                onChangeText={(t) => setNewItem((c) => ({ ...c, customPrice: t }))}
              />
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            placeholder="Enter quantity"
            keyboardType="numeric"
            style={styles.textInput}
            value={newItem.itemQty}
            onChangeText={(t) => setNewItem((c) => ({ ...c, itemQty: t }))}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemsListTitle}>Order Items</Text>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No items added yet</Text>
        </View>
      ) : (
        items.map((it) => (
          <View key={it.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {it.itemName === "Other" ? it.customName : it.itemName}
              </Text>
              <Text style={styles.itemCompany}>{it.companyName || ""}</Text>
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Quantity</Text>
                <Text style={styles.itemDetailValue}>{it.itemQty}</Text>
              </View>
              {it.diameter && (
                <View style={styles.itemDetailRow}>
                  <Text style={styles.itemDetailLabel}>Diameter</Text>
                  <Text style={styles.itemDetailValue}>{it.diameter}</Text>
                </View>
              )}
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Unit Price</Text>
                <Text style={styles.itemDetailValue}>₹{formatMoney(it.itemPrice)}</Text>
              </View>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemTotalLabel}>Total</Text>
                <Text style={styles.itemTotalValue}>₹{formatMoney(lineTotal(it))}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(it.id)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>× Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stepContent: { flex: 1, padding: 10, backgroundColor: "#f9fafc" },
  errorBanner: { flexDirection: "row", backgroundColor: "#fdecea", padding: 12, borderRadius: 12, marginBottom: 12 },
  errorIcon: { marginRight: 8 },
  errorText: { color: "#b91c1c", fontWeight: "600" },
  addItemCard: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 15, fontWeight: "600", marginBottom: 4, color: "#333" },
  textInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: "#fdfdfd", color: "#111" },
  pickerContainer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, backgroundColor: "#fdfdfd" },
  picker: { height: 50, width: "100%" },
  addButton: { backgroundColor: "#007bff", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  itemsListTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyState: { alignItems: "center", marginTop: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, color: "#6b7280" },
  itemCard: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  itemHeader: { marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: "700" },
  itemCompany: { fontSize: 14, color: "#6b7280" },
  itemDetails: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  itemDetailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  itemDetailLabel: { fontWeight: "600", color: "#333" },
  itemDetailValue: { fontWeight: "600", color: "#007bff" },
  itemTotalLabel: { fontWeight: "700", color: "#111" },
  itemTotalValue: { fontWeight: "700", color: "#007bff" },
  removeButton: { marginTop: 8, alignSelf: "flex-end" },
  removeButtonText: { color: "#ff4d4f", fontWeight: "600" },
  nextButton: { backgroundColor: "#10b981", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 16 },
  nextButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
