// components/Step3.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
}) {
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("%"); // "%" or "₹"

  const formatMoney = (v) => (Number(v) || 0).toFixed(2);

  const subtotal = orderTotal(items);
  const transportCost = n(transport);
  const totalBeforeDiscount = subtotal + transportCost;

  const discountValue = discountType === "%"
    ? (totalBeforeDiscount * n(discount)) / 100
    : n(discount);

  const finalTotal = Math.max(totalBeforeDiscount - discountValue, 0);

  return (
    <View style={styles.stepContent}>
      {/* Order Items */}
      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Order Items</Text>
        {items.map((it) => (
          <View key={it.id} style={styles.reviewItem}>
            <View style={styles.reviewItemHeader}>
              <Text style={styles.reviewItemName}>
                {it.itemName === "Other" ? it.customName : it.itemName}
              </Text>
              <Text style={styles.reviewItemTotal}>₹{formatMoney(lineTotal(it))}</Text>
            </View>
            <Text style={styles.reviewItemDetails}>
              {it.companyName} • Qty: {it.itemQty} • ₹{formatMoney(it.itemPrice)}/unit
            </Text>
          </View>
        ))}
      </View>

      {/* Customer Information */}
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
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentBadgeText}>{paymentMethod}</Text>
          </View>
        </View>
      </View>

      {/* Order Summary with Discount */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Transport</Text>
          <Text style={styles.summaryValue}>₹{transportCost.toFixed(2)}</Text>
        </View>

        {/* Discount Input */}
        <View style={[styles.summaryRow, { alignItems: "center" }]}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <View style={styles.discountContainer}>
            <TextInput
              value={discount}
              onChangeText={setDiscount}
              placeholder="0"
              keyboardType="numeric"
              style={styles.discountInput}
            />
            <TouchableOpacity
              style={styles.discountTypeButton}
              onPress={() =>
                setDiscountType(discountType === "%" ? "₹" : "%")
              }
            >
              <Text style={styles.discountTypeText}>
                {discountType === "%" ? "%" : "₹"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={onSubmit}
        >
          <Text style={styles.submitButtonText}>
            {orderToEdit ? "Update Order" : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 12,
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
  paymentBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
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
