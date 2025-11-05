import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { db, auth } from "../firebase";
import { ref, set } from "firebase/database";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const lineTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (items) => (items || []).reduce((s, it) => s + lineTotal(it), 0);

export default function Step3({
  items,
  customerName,
  customerPhone,
  place,
  transport,
  driverName,
  paymentMethod,
  orderToEdit,
  onBack,
  onSubmit,
 discount,
  discountType,
  setDiscount,
  setDiscountType,
}) {

  const userId = auth.currentUser?.uid;
  const formatMoney = (v) => (Number(v) || 0).toFixed(2);

  const subtotal = orderTotal(items);
  const transportCost = n(transport);
  const totalBeforeDiscount = subtotal + transportCost;

  const discountValue =
    discountType === "%"
      ? (totalBeforeDiscount * n(discount)) / 100
      : n(discount);

  const finalTotal = Math.max(totalBeforeDiscount - discountValue, 0);

  // ✅ Handle order submission with discount data included
  const handleSubmit = () => {
    if (n(discount) < 0) {
      Alert.alert("Invalid Discount", "Discount cannot be negative.");
      return;
    }

    const orderData = {
      id: orderToEdit?.id || Date.now().toString(),
      items,
      customerName,
      customerPhone,
      place,
      transport: transportCost,
      driverName,
      paymentMethod,
      discount,
      discountType,
      createdAtMs: orderToEdit?.createdAtMs || Date.now(),
      finalTotal,
      userId: auth.currentUser?.uid,
    };
    const customerData = {
      customerName,
      customerPhone,
      place,
      driverName,
      transport: transportCost,
      paymentMethod,
      userId,
    }

    // use already-declared top-level userId, and create a per-user stable customer id
    if (userId) {
      // sanitize phone to digits (fallback to timestamp if empty)
      const phoneKey = (customerPhone || "").replace(/\D/g, "") || Date.now().toString();
      const Customerid = `${userId}_${phoneKey}`; // stable per-user id for the customer

      // write customer record (top-level) + user index
      set(ref(db, `customers/${Customerid}`), { ...customerData, id: Customerid, userId });
      set(ref(db, `users/${userId}/customers/${Customerid}`), true);
    }

    onSubmit(orderData);
  };
  console.log(discount, discountType, finalTotal);

  return (
    <ScrollView style={styles.stepContent}>
      {/* -------- Order Items -------- */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Order Items</Text>
        {items.map((it) => (
          <View key={it.id} style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemName}>
                {it.itemName === "Other" ? it.customName : it.itemName}
                {it.diameter ? ` (${it.diameter})` : ""}
              </Text>
              <Text style={styles.reviewItemTotal}>₹{formatMoney(lineTotal(it))}</Text>
            </View>
            <Text style={styles.reviewItemDetails}>
              {it.companyName} • Qty: {it.itemQty} • ₹{formatMoney(it.itemPrice)}/unit
            </Text>
          </View>
        ))}
      </View>

      {/* -------- Customer Info -------- */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Customer Information</Text>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Name</Text>
          <Text style={styles.reviewValue}>{customerName}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Phone</Text>
          <Text style={styles.reviewValue}>{customerPhone}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Place</Text>
          <Text style={styles.reviewValue}>{place}</Text>
        </View>
        {driverName ? (
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Driver</Text>
            <Text style={styles.reviewValue}>{driverName}</Text>
          </View>
        ) : null}
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Payment</Text>
          <Text style={styles.reviewValue}>{paymentMethod}</Text>
        </View>
      </View>

      {/* -------- Order Summary -------- */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Transport</Text>
          <Text>₹{transportCost.toFixed(2)}</Text>
        </View>

        {/* Discount Input */}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text>Discount</Text>
          <View style={styles.discountContainer}>
            <TextInput
              value={discount}
              onChangeText={setDiscount}
              placeholder="0"
              keyboardType="numeric"
              style={styles.discountInput}
            />
            <TouchableOpacity
              onPress={() => setDiscountType(discountType === "%" ? "₹" : "%")}
              style={styles.discountTypeButton}
            >
              <Text style={styles.discountTypeText}>{discountType}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* -------- Buttons -------- */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>
            {orderToEdit ? "Update Order" : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  reviewItem: {
    marginBottom: 12,
  },
  reviewItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  reviewItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  reviewItemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reviewItemDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    overflow: "hidden",
    width: 120,
  },
  discountInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  discountTypeButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  discountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
