// SettingsScreen.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OrderContext } from "./Context";
import { db, auth } from "../firebase";
import { ref, set, remove,onValue } from "firebase/database";


export default function SettingsScreen() {
  const { companies, setCompanies } = useContext(OrderContext);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [steelQty, setSteelQty] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [cementQty, setCementQty] = useState("");
  const [isSteel, setIsSteel] = useState(true);
  const toggleSwitch = () => setIsSteel((prev) => !prev);

  const userId = auth.currentUser?.uid;

  // Load companies from Firebase once on mount
  useEffect(() => {
  if (!userId) return;

  const companiesRef = ref(db, `userOrders/${userId}/companies`);
  
  // Listen for changes in Firebase
  const unsubscribe = onValue(companiesRef, (snapshot) => {
    const data = snapshot.val();
    const companiesArray = data ? Object.values(data) : [];
    setCompanies(companiesArray);
  }, (error) => {
    console.error("Error fetching companies:", error);
  });

  // Cleanup listener on unmount
  return () => unsubscribe();
}, [userId]);


  // Add new company
  const addCompany = () => {
    if (!newCompanyName.trim())
      return Alert.alert("Error", "Enter company name");

    if (companies.find((c) => c.name === newCompanyName.trim()))
      return Alert.alert("Error", "Company already exists");

    let newCompany = {};
    if (isSteel) {
      newCompany = {
      id: Date.now().toString(),
      name: newCompanyName.trim(),
      steelPrice: Number(steelPrice) || 0,
      steelQty: Number(steelQty) || 0,
      }
    } else {
      newCompany = {
      id: Date.now().toString(),
      name: newCompanyName.trim(),
      cementPrice: Number(cementPrice) || 0,
      cementQty: Number(cementQty) || 0,
      }
    }

    // Update local state
    setCompanies([newCompany, ...companies]);

    // Reset inputs
    setNewCompanyName("");
    setSteelPrice("");
    setSteelQty("");
    setCementPrice("");
    setCementQty("");

    // Save to Firebase
    const newCompanyRef = ref(db, `userOrders/${userId}/companies/${newCompany.id}`);
    set(newCompanyRef, newCompany).catch((err) =>
      console.error("Error saving company:", err)
    );
  };

  // Delete a company
  const deleteCompany = (company) => {
    Alert.alert(
      "Delete Company",
      `Are you sure you want to delete ${company.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Remove from local state
            setCompanies(companies.filter((c) => c.id !== company.id));

            // Remove from Firebase
            const companyRef = ref(db, `userOrders/${userId}/companies/${company.id}`);
            remove(companyRef).catch((err) =>
              console.error("Error deleting company:", err)
            );
          },
        },
      ]
    );
  };

  // Render each company card
  const renderCompany = ({ item }) => (
    <View style={styles.companyCardContainer}>
      <View style={styles.companyCard}>
        <Text style={styles.companyName}>{item.name}</Text>
        <Text style={styles.priceText}>

          {isSteel ? `Steel: ₹${item.steelPrice} / ${item.steelQty}kg`: `Cement: ₹${item.cementPrice} / ${item.cementQty}bags`}
        </Text>
        
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCompany(item)}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Prices Settings</Text>
      <Switch
        onValueChange={toggleSwitch}
        value={isSteel}
        style={{ margin: 10, alignSelf: "flex-end" }}
      />

      {/* Add new company */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={newCompanyName}
          onChangeText={setNewCompanyName}
        />
        <TextInput
          style={styles.input}
          placeholder={isSteel ? "Steel Price" : "Cement Price"}
          keyboardType="numeric"
          value={isSteel ? steelPrice : cementPrice}
          onChangeText={isSteel ? setSteelPrice : setCementPrice}
        />
        <TextInput
          style={styles.input}
          placeholder={isSteel ? "Steel Qty (tons)" : "Cement Qty (bags)"}
          keyboardType="numeric"
          value={isSteel ? steelQty : cementQty}
          onChangeText={isSteel ? setSteelQty : setCementQty}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addCompany}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Company list */}
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompany}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#0b2545" },
  addContainer: { marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: "#0b84ff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  companyCardContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  companyCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteBtn: {
    backgroundColor: "#ff3b30",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  priceText: { fontSize: 14, fontWeight: "600", color: "#0b84ff" },
});
