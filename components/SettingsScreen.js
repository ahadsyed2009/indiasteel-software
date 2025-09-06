// components/SettingsScreen.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { PriceContext } from "./Context";
import { Ionicons } from "@expo/vector-icons"; // optional for trash icon

export default function SettingsScreen() {
  const { companies, setCompanies } = useContext(PriceContext);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [steelUnit, setSteelUnit] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [cementUnit, setCementUnit] = useState("");

  // Add new company
  const addCompany = () => {
    const name = newCompanyName.trim();
    if (!name) return Alert.alert("Error", "Enter company name");

    const exists = companies.find((c) => c.name === name);
    if (exists) return Alert.alert("Error", "Company already exists");

    const newCompany = {
      id: Date.now().toString(),
      name,
      steelPrice: 0,
      steelUnit: 0,
      cementPrice: 0,
      cementUnit: 0,
    };
    setCompanies([newCompany, ...companies]);
    setNewCompanyName("");
  };

  // Open modal for editing selected company
  const editCompany = (company) => {
    setSelectedCompany(company);
    setSteelPrice(String(company.steelPrice));
    setSteelUnit(String(company.steelUnit));
    setCementPrice(String(company.cementPrice));
    setCementUnit(String(company.cementUnit));
    setShowModal(true);
  };

  // Save changes to selected company
  const saveChanges = () => {
    if (!selectedCompany) return;
    setCompanies(
      companies.map((c) =>
        c.id === selectedCompany.id
          ? {
              ...c,
              steelPrice: Number(steelPrice),
              steelUnit: Number(steelUnit),
              cementPrice: Number(cementPrice),
              cementUnit: Number(cementUnit),
            }
          : c
      )
    );
    setShowModal(false);
    Alert.alert("Saved", "Company prices updated!");
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
            setCompanies(companies.filter((c) => c.id !== company.id));
            if (selectedCompany?.id === company.id) setShowModal(false);
          },
        },
      ]
    );
  };

  const renderCompany = ({ item }) => (
    <View style={styles.companyCardContainer}>
      <TouchableOpacity
        style={styles.companyCard}
        onPress={() => editCompany(item)}
      >
        <Text style={styles.companyName}>{item.name}</Text>
        <Text style={styles.priceText}>
          Steel: ₹{item.steelPrice} / {item.steelUnit}kg
        </Text>
        <Text style={styles.priceText}>
          Cement: ₹{item.cementPrice} / {item.cementUnit} bag
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteCompany(item)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company Prices Settings</Text>

      {/* Add new company */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          value={newCompanyName}
          onChangeText={setNewCompanyName}
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

      {/* Modal for editing */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedCompany?.name}</Text>

            <Text style={styles.label}>Steel Price / Unit</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.modalInput}
                placeholder="Price ₹"
                keyboardType="numeric"
                value={steelPrice}
                onChangeText={setSteelPrice}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Unit kg"
                keyboardType="numeric"
                value={steelUnit}
                onChangeText={setSteelUnit}
              />
            </View>

            <Text style={styles.label}>Cement Price / Unit</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.modalInput}
                placeholder="Price ₹"
                keyboardType="numeric"
                value={cementPrice}
                onChangeText={setCementPrice}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Unit bag"
                keyboardType="numeric"
                value={cementUnit}
                onChangeText={setCementUnit}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#0b2545" },
  addRow: { flexDirection: "row", marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: "#0b84ff",
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
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
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  modalInput: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  saveBtn: { backgroundColor: "#0b84ff", padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 8 },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { backgroundColor: "#eee", padding: 14, borderRadius: 12, alignItems: "center" },
  cancelText: { color: "#333", fontWeight: "600", fontSize: 16 },
});