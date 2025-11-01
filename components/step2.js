// components/Step2.js
import React, { useState, useEffect,useContext, use } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { db, auth } from "../firebase";
import { OrderContext} from "./context";

const paymentOptions = ["Cash", "Credit", "UPI"];

export default function Step2({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  place,
  setPlace,
  transport,
  setTransport,
  driverName,
  setDriverName,
  paymentMethod,
  setPaymentMethod,
  onNext,
  onBack,
}) {
  const { customers, setCustomers } = useContext(OrderContext)
  const [step2Errors, setStep2Errors] = useState({});
 
  // Fetch existing customers
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const customersQ = query(ref(db, `customers`), orderByChild("userId"), equalTo(userId));
    const unsubscribe = onValue(customersQ, (snapshot) => {
      const data = snapshot.val() || {};
      setCustomers(Object.values(data));
    });
    return () => unsubscribe();
  }, []);

  // 🔍 Auto-fill if name or phone matches


 console.log("Step2 Customers:", transport);
   useEffect(() => {
  if (!customerName && !customerPhone) return;
  const foundCustomer = customers.find(
    (c) =>
      c.customerName?.toLowerCase() === customerName?.toLowerCase() ||
      c.customerPhone === customerPhone
  );
  if (foundCustomer) {
    setCustomerName(foundCustomer.customerName);
    setCustomerPhone(foundCustomer.customerPhone);
    setPlace(foundCustomer.place || "");
    setPaymentMethod(foundCustomer.paymentMethod || "");
    // ✅ Added safeguard below
    if (!transport) setTransport(foundCustomer.transport || "");
    setDriverName(foundCustomer.driverName || "");
  }
}, [customerName, customerPhone]);
  // 🚀 Validate and continue
  const handleNext = async () => {
    let errors = {};
    if (!customerName) errors.customerName = "Enter customer name!";
    if (!customerPhone) errors.customerPhone = "Enter customer phone!";
    if (!place) errors.place = "Enter delivery place!";
    if (!paymentMethod) errors.paymentMethod = "Select payment method!";
    if (Object.keys(errors).length > 0) {
      setStep2Errors(errors);
      return;
    }

    const existingCustomer = customers.find(
      (c) =>
        c.customerName?.toLowerCase() === customerName.toLowerCase() ||
        c.customerPhone === customerPhone
    );

    // If not existing, save new customer
    if (!existingCustomer) {
      const newCustomer = {
        customerName,
        customerPhone,
        place,
        transport,
        driverName,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      Alert.alert("✅ New customer added");
    } else {
      console.log("Customer already exists, using existing data");
    }

    setStep2Errors({});
    onNext();
  };

  return (
    <View style={styles.stepContent}>
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Customer Name *</Text>
          <TextInput
            placeholder="Enter customer name"
            style={[
              styles.textInput,
              step2Errors.customerName && styles.inputError,
            ]}
            value={customerName}
            onChangeText={setCustomerName}
            placeholderTextColor="#9CA3AF"
          />
          {step2Errors.customerName && (
            <Text style={styles.fieldError}>{step2Errors.customerName}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            placeholder="Enter phone number"
            style={[
              styles.textInput,
              step2Errors.customerPhone && styles.inputError,
            ]}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
          />
          {step2Errors.customerPhone && (
            <Text style={styles.fieldError}>{step2Errors.customerPhone}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Place *</Text>
          <TextInput
            placeholder="Enter delivery location"
            style={[
              styles.textInput,
              step2Errors.place && styles.inputError,
            ]}
            value={place}
            onChangeText={setPlace}
            placeholderTextColor="#9CA3AF"
          />
          {step2Errors.place && (
            <Text style={styles.fieldError}>{step2Errors.place}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Transport Cost</Text>
          <TextInput
            placeholder="Enter transport cost (₹)"
            style={[
              styles.textInput,
              step2Errors.customerPhone && styles.inputError,
            ]}
            value={String(transport)}
            onChangeText={setTransport}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Driver Name</Text>
          <TextInput
            placeholder="Enter driver name (optional)"
            style={styles.textInput}
            value={driverName}
            onChangeText={setDriverName}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Payment Method *</Text>
          <View
            style={[
              styles.pickerContainer,
              step2Errors.paymentMethod && styles.inputError,
            ]}
          >
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v)}
              style={styles.picker}
            >
              <Picker.Item label="Select Payment Method" value="" />
              {paymentOptions.map((p) => (
                <Picker.Item key={p} label={p} value={p} />
              ))}
            </Picker>
          </View>
          {step2Errors.paymentMethod && (
            <Text style={styles.fieldError}>{step2Errors.paymentMethod}</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: { flex: 1 },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
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
    marginBottom: 5, 
  },
  inputError: { borderColor: "#EF4444" },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: { height: 50 },
  buttonContainer: { flexDirection: "row", gap: 12 },
  backButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  nextButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});