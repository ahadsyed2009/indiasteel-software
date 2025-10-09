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
    customPrice: "" 
  });
  const [newItemCompany, setNewItemCompany] = useState("");
  const [step1Error, setStep1Error] = useState("");

 const calculateUnitPrice = (item, companyName) => {
  if (!item || !companyName) return 0;
  const name = (item.itemName || "").toLowerCase();
  const company = (companies || []).find((c) => c.name === companyName);
  if (!company) return 0;

  // 🔧 Corrected logic
  if (name.includes("steel")) {
    const qty = company.steelQty && company.steelQty > 0 ? company.steelQty : 1;
    const price = company.steelPrice && company.steelPrice > 0 ? company.steelPrice : 650;
    return price / qty; // ✅ price per kg
  }

  if (name.includes("cement")) {
    const qty = company.cementQty && company.cementQty > 0 ? company.cementQty : 1;
    const price = company.cementPrice && company.cementPrice > 0 ? company.cementPrice : 350;
    return price / qty; // ✅ price per bag
  }

  return n(item.itemPrice);
};


  const addNewItem = () => {
    if (!newItem.itemName || !newItem.itemQty) {
      return Alert.alert("Error", "Fill item details");
    }
    if ((newItem.itemName || "").toLowerCase() !== "other" && !newItemCompany) {
      return Alert.alert("Error", "Select a company");
    }

    const qty = n(newItem.itemQty);
    const unitPrice =
      (newItem.itemName || "").toLowerCase() === "other"
        ? n(newItem.customPrice)
        : calculateUnitPrice(newItem, newItemCompany);

    const itemToSave = {
      id: Date.now().toString(),
      ...newItem,
      itemQty: qty,
      itemPrice: unitPrice,
      companyName: newItemCompany,
    };

    setItems((prev) => [...prev, itemToSave]);
    setNewItem({ itemName: "", itemQty: "", customName: "", customPrice: "" });
    setNewItemCompany("");
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
    <View style={styles.stepContent}>
      {step1Error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{step1Error}</Text>
        </View>
      ) : null}

      <View style={styles.addItemCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Add Item</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        </View>

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
                  .filter((company) => {
                    if (newItem.itemName.toLowerCase() === "steel") return company.steelPrice > 0;
                    if (newItem.itemName.toLowerCase() === "cement") return company.cementPrice > 0;
                    return false;
                  })
                  .map((company) => (
                    <Picker.Item key={company.name} label={company.name} value={company.name} />
                  ))}
              </Picker>
            </View>
          </View>
        )}

        {newItem.itemName === "Other" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput 
                placeholder="Enter item name" 
                style={styles.textInput} 
                value={newItem.customName} 
                onChangeText={(t) => setNewItem((c) => ({ ...c, customName: t }))}
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput 
            placeholder="Enter quantity" 
            style={styles.textInput} 
            keyboardType="numeric" 
            value={newItem.itemQty} 
            onChangeText={(t) => setNewItem((c) => ({ ...c, itemQty: t }))}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsListHeader}>
        <Text style={styles.itemsListTitle}>Order Items</Text>
        <View style={styles.itemCount}>
          <Text style={styles.itemCountText}>{(items || []).length}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No items added yet</Text>
          <Text style={styles.emptySubtitle}>Add your first item to get started</Text>
        </View>
      ) : (
        (items || []).map((it) => (
          <View key={it.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemTitle}>
                  {it.itemName === "Other" ? it.customName : it.itemName}
                </Text>
                <TouchableOpacity onPress={() => removeItem(it.id)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.itemCompany}>{it.companyName || "No Company"}</Text>
            </View>
            
            <View style={styles.itemDetails}>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Quantity</Text>
                <Text style={styles.itemDetailValue}>{it.itemQty}</Text>
              </View>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Unit Price</Text>
                <Text style={styles.itemDetailValue}>₹{formatMoney(it.itemPrice)}</Text>
              </View>
              <View style={[styles.itemDetailRow, styles.totalRow]}>
                <Text style={styles.itemTotalLabel}>Total</Text>
                <Text style={styles.itemTotalValue}>₹{formatMoney(lineTotal(it))}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#991B1B",
  },
  addItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  addButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  itemsListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  itemsListTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  itemCount: {
    backgroundColor: "#3B82F6",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  removeButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#F87171",
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  itemCompany: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  itemDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemDetailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 4,
  },
  itemTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  itemTotalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  nextButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});