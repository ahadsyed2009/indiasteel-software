// settprice.js
import React, { useContext, useState } from "react";
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
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { OrderContext } from "./context";
import { db, auth } from "../firebase";
import { ref, set, remove } from "firebase/database";

export default function SettPrice() {
  const { companies, setCompanies } = useContext(OrderContext);
  const userId = auth.currentUser?.uid;

  const [newCompanyName, setNewCompanyName] = useState("");
  const [type, setType] = useState("steel");
  const [steelDetails, setSteelDetails] = useState([{ diameter: "6mm", price: "", qty: "" }]);
  const [cementPrice, setCementPrice] = useState("");
  const [cementQty, setCementQty] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  // --- Steel handlers ---
  const addSteelRow = () => setSteelDetails([...steelDetails, { diameter: "6mm", price: "", qty: "" }]);
  const updateSteelField = (index, field, value) => {
    const updated = [...steelDetails];
    updated[index][field] = value;
    setSteelDetails(updated);
  };
  const removeSteelRow = (index) => {
    const updated = steelDetails.filter((_, i) => i !== index);
    setSteelDetails(updated.length ? updated : [{ diameter: "6mm", price: "", qty: "" }]);
  };

  // --- Add company ---
  const addCompany = () => {
    if (!newCompanyName.trim()) return Alert.alert("Error", "Enter company name");
    if (companies.find((c) => c.name === newCompanyName.trim()))
      return Alert.alert("Error", "Company already exists");

    let newCompany = { id: Date.now().toString(), name: newCompanyName.trim(), type };

    if (type === "steel" || type === "both") {
      if (!steelDetails.every((s) => s.price && s.qty))
        return Alert.alert("Error", "Enter valid price and quantity for all steel diameters");
      newCompany.steelDetails = steelDetails.map((s) => ({
        diameter: s.diameter,
        price: Number(s.price),
        qty: Number(s.qty),
      }));
    }
    if (type === "cement" || type === "both") {
      if (!cementPrice || !cementQty) return Alert.alert("Error", "Enter valid cement price and quantity");
      newCompany.cementPrice = Number(cementPrice);
      newCompany.cementQty = Number(cementQty);
    }

    setCompanies([newCompany, ...companies]);
    resetForm();

    const newCompanyRef = ref(db, `userOrders/${userId}/companies/${newCompany.id}`);
    set(newCompanyRef, newCompany).catch((err) => console.error("Error saving company:", err));
  };

  const resetForm = () => {
    setNewCompanyName("");
    setType("steel");
    setSteelDetails([{ diameter: "6mm", price: "", qty: "" }]);
    setCementPrice("");
    setCementQty("");
  };

  // --- Delete company ---
  const deleteCompany = (company) => {
    Alert.alert("Delete Company", `Are you sure you want to delete ${company.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCompanies(companies.filter((c) => c.id !== company.id));
          const companyRef = ref(db, `userOrders/${userId}/companies/${company.id}`);
          remove(companyRef).catch((err) => console.error("Error deleting company:", err));
        },
      },
    ]);
  };

  // --- Edit company ---
  const startEditCompany = (company) => {
    setEditCompany({ ...company });
    setEditModalVisible(true);
  };
  const saveEditCompany = () => {
    if (!editCompany) return;
    setCompanies(companies.map((c) => (c.id === editCompany.id ? editCompany : c)));
    const companyRef = ref(db, `userOrders/${userId}/companies/${editCompany.id}`);
    set(companyRef, editCompany).catch((err) => console.error("Error updating company:", err));
    setEditModalVisible(false);
    setEditCompany(null);
  };

  // --- Render company card ---
  const renderCompany = ({ item }) => (
    <View style={styles.companyCardContainer}>
      <View style={styles.companyCard}>
        <Text style={styles.companyName}>{item.name}</Text>

        {item.steelDetails &&
          item.steelDetails.map((s, idx) => (
            <Text style={styles.priceText} key={idx}>
              Steel {s.diameter}: ₹{s.price} / {s.qty}kg
            </Text>
          ))}

        {item.cementPrice !== undefined && (
          <Text style={styles.priceText}>
            Cement: ₹{item.cementPrice} / {item.cementQty}bags
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={() => startEditCompany(item)}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCompany(item)}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Company Prices</Text>

        {/* Add New Company */}
        <ScrollView style={{ marginBottom: 20 }}>
          <View style={styles.addContainer}>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={newCompanyName}
              onChangeText={setNewCompanyName}
            />

            <Picker selectedValue={type} style={styles.Picker} onValueChange={(v) => setType(v)}>
              <Picker.Item label="Steel" value="steel" />
              <Picker.Item label="Cement" value="cement" />
              <Picker.Item label="Both" value="both" />
            </Picker>

            {(type === "steel" || type === "both") && (
              <View style={styles.groupBox}>
                <Text style={styles.groupTitle}>Steel</Text>
                {steelDetails.map((s, idx) => (
                  <View key={idx} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Picker
                        selectedValue={s.diameter}
                        style={{ flex: 1, height: 50 }}
                        onValueChange={(value) => updateSteelField(idx, "diameter", value)}
                      >
                        <Picker.Item label="6mm" value="6mm" />
                        <Picker.Item label="8mm" value="8mm" />
                        <Picker.Item label="10mm" value="10mm" />
                        <Picker.Item label="12mm" value="12mm" />
                        <Picker.Item label="16mm" value="16mm" />
                        <Picker.Item label="20mm" value="20mm" />
                        <Picker.Item label="25mm" value="25mm" />
                      </Picker>

                      <TouchableOpacity onPress={() => removeSteelRow(idx)} style={{ marginLeft: 8 }}>
                        <Ionicons name="trash-outline" size={28} color="#ff4d4f" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Price"
                      keyboardType="numeric"
                      value={String(s.price)}
                      onChangeText={(val) => updateSteelField(idx, "price", val)}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Quantity (kg)"
                      keyboardType="numeric"
                      value={String(s.qty)}
                      onChangeText={(val) => updateSteelField(idx, "qty", val)}
                    />
                  </View>
                ))}
                <TouchableOpacity style={styles.addBtn} onPress={addSteelRow}>
                  <Text style={styles.addBtnText}>+ Add Diameter</Text>
                </TouchableOpacity>
              </View>
            )}

            {(type === "cement" || type === "both") && (
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
            )}

            <TouchableOpacity style={styles.addBtn} onPress={addCompany}>
              <Text style={styles.addBtnText}>+ Add Company</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Company List */}
        <FlatList data={companies} keyExtractor={(item) => item.id} renderItem={renderCompany} />

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                        onChangeText={(text) => setEditCompany({ ...editCompany, name: text })}
                      />

                      {editCompany.steelDetails &&
                        editCompany.steelDetails.map((s, idx) => (
                          <View key={idx} style={{ marginBottom: 10 }}>
                            <Picker
                              selectedValue={s.diameter}
                              style={styles.Picker}
                              onValueChange={(val) => {
                                const updated = [...editCompany.steelDetails];
                                updated[idx].diameter = val;
                                setEditCompany({ ...editCompany, steelDetails: updated });
                              }}
                            >
                              <Picker.Item label="6mm" value="6mm" />
                              <Picker.Item label="8mm" value="8mm" />
                              <Picker.Item label="10mm" value="10mm" />
                              <Picker.Item label="12mm" value="12mm" />
                              <Picker.Item label="16mm" value="16mm" />
                              <Picker.Item label="20mm" value="20mm" />
                              <Picker.Item label="25mm" value="25mm" />
                            </Picker>
                            <TextInput
                              style={styles.input}
                              placeholder="Price"
                              keyboardType="numeric"
                              value={String(s.price)}
                              onChangeText={(val) => {
                                const updated = [...editCompany.steelDetails];
                                updated[idx].price = val;
                                setEditCompany({ ...editCompany, steelDetails: updated });
                              }}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Quantity (kg)"
                              keyboardType="numeric"
                              value={String(s.qty)}
                              onChangeText={(val) => {
                                const updated = [...editCompany.steelDetails];
                                updated[idx].qty = val;
                                setEditCompany({ ...editCompany, steelDetails: updated });
                              }}
                            />
                          </View>
                        ))}

                      {editCompany.cementPrice !== undefined && (
                        <>
                          <TextInput
                            style={styles.input}
                            placeholder="Cement Price"
                            keyboardType="numeric"
                            value={String(editCompany.cementPrice)}
                            onChangeText={(val) => setEditCompany({ ...editCompany, cementPrice: Number(val) })}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Cement Qty (bags)"
                            keyboardType="numeric"
                            value={String(editCompany.cementQty)}
                            onChangeText={(val) => setEditCompany({ ...editCompany, cementQty: Number(val) })}
                          />
                        </>
                      )}
                    </>
                  )}

                  <View style={{ flexDirection: "row", marginTop: 16 }}>
                    <TouchableOpacity style={[styles.addBtn, { flex: 1, marginRight: 8 }]} onPress={saveEditCompany}>
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

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f2f5" },
  title: { fontSize: 26, fontWeight: "700", color: "#1a1a1a", marginBottom: 20, textAlign: "center" },
  addContainer: { marginBottom: 20, backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  input: { backgroundColor: "#fdfdfd", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#dcdcdc", marginBottom: 10, fontSize: 16 },
  addBtn: { backgroundColor: "#007bff", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 },
  companyCardContainer: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  companyCard: { flex: 1, backgroundColor: "#fff", padding: 18, borderRadius: 18, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, borderWidth: 0.5, borderColor: "#eee" },
  companyName: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 6 },
  priceText: { fontSize: 15, fontWeight: "600", color: "#007bff" },
  editBtn: { backgroundColor: "#f0ad4e", padding: 12, borderRadius: 12, marginLeft: 8, justifyContent: "center", alignItems: "center" },
  deleteBtn: { backgroundColor: "#ff4d4f", padding: 12, borderRadius: 12, marginLeft: 8, justifyContent: "center", alignItems: "center" },
  groupBox: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#f1f1f1" },
  groupTitle: { fontWeight: "700", marginBottom: 8, fontSize: 17, color: "#1a1a1a" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { width: "100%", backgroundColor: "#fff", borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 16, textAlign: "center", color: "#1a1a1a" },
  Picker: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, backgroundColor: "#fdfdfd", marginVertical: 8, height: 50, justifyContent: "center" },
});
