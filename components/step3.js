import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet
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
    <View style={{ flex: 1, padding: 12 }}>
      {/* Order Items */}
      <View>
        <Text>Order Items</Text>
        {items.map((it) => (
          <View key={it.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text>
                {it.itemName === "Other" ? it.customName : it.itemName}
                {it.diameter ? ` (${it.diameter})` : ""}
              </Text>
              <Text>₹{formatMoney(lineTotal(it))}</Text>
            </View>
            <Text>
              {it.companyName} • Qty: {it.itemQty} • ₹{formatMoney(it.itemPrice)}/unit
            </Text>
          </View>
        ))}
      </View>

      {/* Customer Information */}
      <View>
        <Text>Customer Information</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Name</Text>
          <Text>{customerName}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Phone</Text>
          <Text>{customerPhone}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Place</Text>
          <Text>{place}</Text>
        </View>
        {driverName ? (
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text>Driver</Text>
            <Text>{driverName}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Payment</Text>
          <Text>{paymentMethod}</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View>
        <Text>Order Summary</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Subtotal</Text>
          <Text>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>Transport</Text>
          <Text>₹{transportCost.toFixed(2)}</Text>
        </View>

        {/* Discount Input */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Discount</Text>
          <TextInput
            value={discount}
            onChangeText={setDiscount}
            placeholder="0"
            keyboardType="numeric"
            style={{ marginLeft: 8, borderWidth: 1, padding: 4, width: 80 }}
          />
          <TouchableOpacity onPress={() => setDiscountType(discountType === "%" ? "₹" : "%")}>
            <Text>{discountType}</Text>
          </TouchableOpacity>
        </View>

        <Text>Total Amount: ₹{finalTotal.toFixed(2)}</Text>
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ flex: 1, marginRight: 8, backgroundColor: "#ccc", padding: 12, alignItems: "center" }}>
          <Text>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSubmit} style={{ flex: 1, marginLeft: 8, backgroundColor: "#007bff", padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>{orderToEdit ? "Update Order" : "Place Order"}</Text>
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
