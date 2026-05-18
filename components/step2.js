// components/Step2.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { OrderContext } from "./context";

const paymentOptions = ["Cash", "Credit", "UPI"];

const normalizePhone = (phone) => (phone || "").replace(/\D/g, "");

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
  const { customers } = useContext(OrderContext); // ✅ use already-fetched shop customers
  const [step2Errors, setStep2Errors] = useState({});
  const [lastAutoFilledPhone, setLastAutoFilledPhone] = useState(""); // ✅ track which phone was autofilled

  // ✅ Auto-fill when phone matches an existing customer
  // Runs every time customerPhone changes
  useEffect(() => {
    const normalized = normalizePhone(customerPhone);

    // Don't re-trigger if same phone already autofilled, or phone too short
    if (!normalized || normalized.length < 6) return;
    if (normalized === normalizePhone(lastAutoFilledPhone)) return;

    const found = (customers || []).find(
      (c) => normalizePhone(c.customerPhone) === normalized
    );

    if (found) {
      setCustomerName(found.customerName || "");
      setPlace(found.place || "");
      setPaymentMethod(found.paymentMethod || "");
      setTransport(found.transport ? String(found.transport) : "");
      setDriverName(found.driverName || "");
      setLastAutoFilledPhone(customerPhone); // ✅ remember this phone to avoid repeat
      Alert.alert("Customer Found", `Auto-filled details for ${found.customerName}`);
    }
  }, [customerPhone, customers]);

  // ✅ Reset autofill tracking when phone is cleared
  useEffect(() => {
    if (!customerPhone) {
      setLastAutoFilledPhone("");
    }
  }, [customerPhone]);

  const handleNext = () => {
    let errors = {};
    if (!customerName)   errors.customerName   = "Enter customer name!";
    if (!customerPhone)  errors.customerPhone  = "Enter customer phone!";
    if (!place)          errors.place          = "Enter delivery place!";
    if (!paymentMethod)  errors.paymentMethod  = "Select payment method!";

    if (Object.keys(errors).length > 0) {
      setStep2Errors(errors);
      return;
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
            style={[styles.textInput, step2Errors.customerName && styles.inputError]}
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
            style={[styles.textInput, step2Errors.customerPhone && styles.inputError]}
            value={customerPhone}
            onChangeText={setCustomerPhone} // ✅ NewOrder.js handles lookup via handlePhoneChange
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
            style={[styles.textInput, step2Errors.place && styles.inputError]}
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
            style={styles.textInput}
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
          <View style={[styles.pickerContainer, step2Errors.paymentMethod && styles.inputError]}>
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
  stepContent:      { flex: 1 },
  formCard:         { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  inputGroup:       { marginBottom: 16 },
  inputLabel:       { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  textInput:        { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 14, fontSize: 15, color: "#111827", backgroundColor: "#FFFFFF", marginBottom: 5 },
  inputError:       { borderColor: "#EF4444" },
  fieldError:       { fontSize: 12, color: "#EF4444", marginTop: 4, fontWeight: "500" },
  pickerContainer:  { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, backgroundColor: "#FFFFFF", overflow: "hidden" },
  picker:           { height: 50 },
  buttonContainer:  { flexDirection: "row", gap: 12 },
  backButton:       { flex: 1, backgroundColor: "#E5E7EB", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  backButtonText:   { fontSize: 14, fontWeight: "600", color: "#111827" },
  nextButton:       { flex: 1, backgroundColor: "#3B82F6", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  nextButtonText:   { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});