import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

export default function OrdersPage() {
  const navigation = useNavigation();


  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [orderType, setOrderType] = useState("cement");

  const [cementBrand, setCementBrand] = useState("");
  const [steelBrand, setSteelBrand] = useState("");
  const [cementQty, setCementQty] = useState("");
  const [steelQty, setSteelQty] = useState("");
  const [distance, setDistance] = useState("");

  const resetForm = () => {
    setCustomer("");
    setPhone("");
    setDriverPhone("");
    setOrderType("cement");
    setCementBrand("");
    setSteelBrand("");
    setCementQty("");
    setSteelQty("");
    setDistance("");
  };

  // Example loading/transport charges calculator
  const getLoadingCharges = (steel, cement) => {
    return (parseInt(steel || 0) * 20) + (parseInt(cement || 0) * 10);
  };

  const getTransportCharges = (steel, cement, km) => {
    const qty = parseInt(steel || 0) + parseInt(cement || 0);
    return qty * parseInt(km || 0) * 2;
  };

  const handlePlaceOrder = () => {
    const newOrder = {
      id: Date.now(),
      customer,
      phone,
      driverPhone,
      orderType,
      steelBrand,
      cementBrand,
      steelQty,
      cementQty,
      distance,
      loading: getLoadingCharges(steelQty, cementQty),
      transport: getTransportCharges(steelQty, cementQty, distance),
    };

    // ✅ Send order back to HomeScreen
    navigation.navigate("Home", { newOrder });

    resetForm();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Place Order</Text>

      {/* Customer Name */}
      <TextInput
        placeholder="Customer Name"
        style={styles.input}
        value={customer}
        onChangeText={setCustomer}
      />

      {/* Customer Phone */}
      <TextInput
        placeholder="Customer Phone"
        style={styles.input}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Driver Phone */}
      <TextInput
        placeholder="Driver Phone"
        style={styles.input}
        keyboardType="phone-pad"
        value={driverPhone}
        onChangeText={setDriverPhone}
      />

      {/* Order Type */}
      <Text style={styles.label}>Select Order Type</Text>
      <Picker
        selectedValue={orderType}
        onValueChange={(itemValue) => setOrderType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Cement" value="cement" />
        <Picker.Item label="Steel" value="steel" />
        <Picker.Item label="Both" value="both" />
      </Picker>

      {/* Cement Section */}
      {(orderType === "cement" || orderType === "both") && (
        <>
          <Text style={styles.label}>Cement Company</Text>
          <Picker
            selectedValue={cementBrand}
            onValueChange={(itemValue) => setCementBrand(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Company" value="" />
            <Picker.Item label="ACC" value="ACC" />
            <Picker.Item label="UltraTech" value="UltraTech" />
            <Picker.Item label="Ambuja" value="Ambuja" />
          </Picker>

          <TextInput
            placeholder="Cement Quantity (bags)"
            style={styles.input}
            keyboardType="numeric"
            value={cementQty}
            onChangeText={setCementQty}
          />
        </>
      )}

      {/* Steel Section */}
      {(orderType === "steel" || orderType === "both") && (
        <>
          <Text style={styles.label}>Steel Company</Text>
          <Picker
            selectedValue={steelBrand}
            onValueChange={(itemValue) => setSteelBrand(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Company" value="" />
            <Picker.Item label="TATA" value="TATA" />
            <Picker.Item label="JSW" value="JSW" />
            <Picker.Item label="SAIL" value="SAIL" />
          </Picker>

          <TextInput
            placeholder="Steel Quantity (tons)"
            style={styles.input}
            keyboardType="numeric"
            value={steelQty}
            onChangeText={setSteelQty}
          />
        </>
      )}

      {/* Distance */}
      <TextInput
        placeholder="Distance (km)"
        style={styles.input}
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
      />

      {/* Place Order Button */}
      <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  label: { marginTop: 12, fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "white",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
