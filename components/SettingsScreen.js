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
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { OrderContext } from "./context";
import { db, auth } from "../firebase";
import { ref, set, remove, onValue } from "firebase/database";

export default function SettingsScreen() {
  const { companies, setCompanies } = useContext(OrderContext);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [steelPrice, setSteelPrice] = useState("");
  const [steelQty, setSteelQty] = useState("");
  const [cementPrice, setCementPrice] = useState("");
  const [cementQty, setCementQty] = useState("");
  const [type, setType] = useState("steel");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const userId = auth.currentUser?.uid;



  // Add company
  const addCompany = () => {
    if (!newCompanyName.trim())
      return Alert.alert("Error", "Enter company name");

    if (companies.find((c) => c.name === newCompanyName.trim()))
      return Alert.alert("Error", "Company already exists");

    let newCompany = {
      id: Date.now().toString(),
      name: newCompanyName.trim(),
      type,
    };

    if (type === "steel" || type === "both") {
      if (!steelPrice || !steelQty) {
        return Alert.alert("Error", "Enter valid steel price and quantity");
      }
      newCompany.steelPrice = Number(steelPrice);
      newCompany.steelQty = Number(steelQty);
    }
    if (type === "cement" || type === "both") {
      if (!cementPrice || !cementQty) {
        return Alert.alert("Error", "Enter valid cement price and quantity");
      }
      newCompany.cementPrice = Number(cementPrice);
      newCompany.cementQty = Number(cementQty);
    }

    setCompanies([newCompany, ...companies]);

    setNewCompanyName("");
    setSteelPrice("");
    setSteelQty("");
    setCementPrice("");
    setCementQty("");
    setType("steel");

    const newCompanyRef = ref(
      db,
      `userOrders/${userId}/companies/${newCompany.id}`
    );
    set(newCompanyRef, newCompany).catch((err) =>
      console.error("Error saving company:", err)
    );
  };

  // Delete
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
            const companyRef = ref(
              db,
              `userOrders/${userId}/companies/${company.id}`
            );
            remove(companyRef).catch((err) =>
              console.error("Error deleting company:", err)
            );
          },
        },
      ]
    );
  };

  // Start edit
  const startEditCompany = (company) => {
    setEditCompany({ ...company });
    setEditModalVisible(true);
  };

  // Save edit
  const saveEditCompany = () => {
    if (!editCompany) return;

    setCompanies(
      companies.map((c) => (c.id === editCompany.id ? editCompany : c))
    );

    const companyRef = ref(
      db,
      `userOrders/${userId}/companies/${editCompany.id}`
    );
    set(companyRef, editCompany).catch((err) =>
      console.error("Error updating company:", err)
    );

    setEditModalVisible(false);
    setEditCompany(null);
  };

  // Render card
  const renderCompany = ({ item }) => (
    <View style={styles.companyCardContainer}>
      <View style={styles.companyCard}>
        <Text style={styles.companyName}>{item.name}</Text>
        {item.steelPrice !== undefined && (
          <Text style={styles.priceText}>
            Steel: ₹{item.steelPrice} / {item.steelQty}kg
          </Text>
        )}
        {item.cementPrice !== undefined && (
          <Text style={styles.priceText}>
            Cement: ₹{item.cementPrice} / {item.cementQty}bags
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => startEditCompany(item)}
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
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
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={newCompanyName}
          onChangeText={setNewCompanyName}
        />

        <Picker
          selectedValue={type}
          style={styles.input}
          onValueChange={(value) => setType(value)}
        >
          <Picker.Item label="Steel" value="steel" />
          <Picker.Item label="Cement" value="cement" />
          <Picker.Item label="Both" value="both" />
        </Picker>

        {/* Dynamic inputs */}
        {type === "steel" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Steel Price"
              keyboardType="numeric"
              value={steelPrice}
              onChangeText={setSteelPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Steel Qty (kg)"
              keyboardType="numeric"
              value={steelQty}
              onChangeText={setSteelQty}
            />
          </>
        )}
        {type === "cement" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cement Price"
              keyboardType="numeric"
              value={cementPrice}
              onChangeText={setCementPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Cement Qty (bags)"
              keyboardType="numeric"
              value={cementQty}
              onChangeText={setCementQty}
            />
          </>
        )}
        {type === "both" && (
          <>
            <View style={styles.groupBox}>
              <Text style={styles.groupTitle}>Steel</Text>
              <TextInput
                style={styles.input}
                placeholder="Steel Price"
                keyboardType="numeric"
                value={steelPrice}
                onChangeText={setSteelPrice}
              />
              <TextInput
                style={styles.input}
                placeholder="Steel Qty (kg)"
                keyboardType="numeric"
                value={steelQty}
                onChangeText={setSteelQty}
              />
            </View>
            <View style={styles.groupBox}>
              <Text style={styles.groupTitle}>Cement</Text>
              <TextInput
                style={styles.input}
                placeholder="Cement Price"
                keyboardType="numeric"
                value={cementPrice}
                onChangeText={setCementPrice}
              />
              <TextInput
                style={styles.input}
                placeholder="Cement Qty (bags)"
                keyboardType="numeric"
                value={cementQty}
                onChangeText={setCementQty}
              />
            </View>
          </>
        )}

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

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Company</Text>
              {editCompany && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    value={editCompany.name}
                    onChangeText={(text) =>
                      setEditCompany({ ...editCompany, name: text })
                    }
                  />
                  {editCompany.steelPrice !== undefined && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Steel Price"
                        keyboardType="numeric"
                        value={String(editCompany.steelPrice)}
                        onChangeText={(text) =>
                          setEditCompany({
                            ...editCompany,
                            steelPrice: Number(text),
                          })
                        }
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Steel Qty (kg)"
                        keyboardType="numeric"
                        value={String(editCompany.steelQty)}
                        onChangeText={(text) =>
                          setEditCompany({
                            ...editCompany,
                            steelQty: Number(text),
                          })
                        }
                      />
                    </>
                  )}
                  {editCompany.cementPrice !== undefined && (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="Cement Price"
                        keyboardType="numeric"
                        value={String(editCompany.cementPrice)}
                        onChangeText={(text) =>
                          setEditCompany({
                            ...editCompany,
                            cementPrice: Number(text),
                          })
                        }
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Cement Qty (bags)"
                        keyboardType="numeric"
                        value={String(editCompany.cementQty)}
                        onChangeText={(text) =>
                          setEditCompany({
                            ...editCompany,
                            cementQty: Number(text),
                          })
                        }
                      />
                    </>
                  )}
                </>
              )}
              <View style={{ flexDirection: "row", marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.addBtn, { flex: 1, marginRight: 8 }]}
                  onPress={saveEditCompany}
                >
                  <Text style={styles.addBtnText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteBtn, { flex: 1 }]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditCompany(null);
                  }}
                >
                  <Text style={styles.addBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f0f2f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0b2545",
  },
  addContainer: { marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
    height: 50,
  },
  addBtn: {
    backgroundColor: "#0b84ff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  companyCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
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
  editBtn: {
    backgroundColor: "#ffaa00",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: "#ff3b30",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  priceText: { fontSize: 14, fontWeight: "600", color: "#0b84ff" },
  groupBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  groupTitle: { fontWeight: "bold", marginBottom: 6, fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
});
