// settprice.js
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
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { OrderContext } from "./context";
import { db, auth } from "../firebase";
import { ref, set, remove, onValue } from "firebase/database";

export default function settprice() {
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
    <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
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
          style={styles.Picker}
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
            <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
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
        </TouchableWithoutFeedback>
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafc", // Softer neutral background
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },

  // Add Section
  addContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  input: {
    backgroundColor: "#fdfdfd",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    marginBottom: 10,
    height: 48,
    fontSize: 16,
    color: "#333",
  },

  addBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Company Cards
  companyCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  companyCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#eee",
  },

  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  priceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007bff",
  },

  editBtn: {
    backgroundColor: "#f0ad4e",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f0ad4e",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },

  deleteBtn: {
    backgroundColor: "#ff4d4f",
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff4d4f",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },

  // Groups
  groupBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  groupTitle: {
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 17,
    color: "#1a1a1a",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#1a1a1a",
  },

  Picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fdfdfd",
    marginVertical: 8,
    height: 50,
    justifyContent: "center",
  },
});
