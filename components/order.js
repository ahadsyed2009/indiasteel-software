import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useContex } from "./context";
import { useNavigation } from "@react-navigation/native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { db } from '../firebase';
import { ref, set} from 'firebase/database';


export default function OrdersPage() {
  const {
    customers,
    phone,
    customer,
    setPhone,
    setCustomer,
    driverPhone,
    setDriverPhone,
    orderType,
    setOrderType,
    cementBrand,
    setCementBrand,
    cementQty,
    setCementQty,
    steelBrand,
    setSteelBrand,
    steelQty,
    setSteelQty,
    distance,
    setDistance,
    searchText,
    setSearchText,
    getLoadingCharges,
    getTransportCharges,
    resetForm
  } = useContex();
 const navigation = useNavigation();
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

   const handlePlaceOrder = () => {
       const id = Date.now().toString();
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
      navigation.navigate("Home", { newOrder });
      set(ref(db, 'orders/' + id), newOrder)
      .then(() => {
        resetForm();
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  
     
      resetForm();
    };

  const handleSearchChange = (text) => {
    setSearchText(text);
    setCustomer(text);


    if (text.trim().length > 0) {
      const filtered = customers.filter((c) =>
        c.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (name) => {
    setSearchText(name);
    setCustomer(name);
    setShowSuggestions(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{flexDirection:'row',marginTop:15,}}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{marginRight:10,}}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
      <Text style={styles.header}>Place Order</Text>
      </View>
      {/* Customer Name */}
      <TextInput
        placeholder="Customer Name"
        style={styles.input}
        value={searchText}
        onChangeText={handleSearchChange}
      />
      {showSuggestions && (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={filteredCustomers}
          keyExtractor={(item) => item.id.toString()}
          style={styles.suggestionsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selectCustomer(item.name)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        keyboardType="phone-pad"
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
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB", },
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
  suggestionsList: {
    marginTop: 4,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
