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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { OrderContext } from "./context";
import { db, auth } from "../firebase";
import { ref, set, remove } from "firebase/database";

export default function SettPrice() {
  const { companies, setCompanies } = useContext(OrderContext);
  const userId = auth.currentUser?.uid;

  const [newCompanyName, setNewCompanyName] = useState("");
  const [type, setType] = useState("steel");
  const [steelDetails, setSteelDetails] = useState([{ diameter: "6", price: "", qty: "" }]);
  const [cementPrice, setCementPrice] = useState("");
  const [cementQty, setCementQty] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // --- Steel handlers ---
  const addSteelRow = () => setSteelDetails([...steelDetails, { diameter: "6", price: "", qty: "" }]);
  const updateSteelField = (index, field, value) => {
    const updated = [...steelDetails];
    updated[index][field] = value;
    setSteelDetails(updated);
  };
  const removeSteelRow = (index) => {
    const updated = steelDetails.filter((_, i) => i !== index);
    setSteelDetails(updated.length ? updated : [{ diameter: "6", price: "", qty: "" }]);
  };

  // --- Add company ---
  const addCompany = () => {
    if (!newCompanyName.trim()) return Alert.alert("Error", "Enter company name");
    if (companies.find((c) => c.name === newCompanyName.trim()))
      return Alert.alert("Error", "Company already exists");

    let newCompany = { id: Date.now().toString(), name: newCompanyName.trim(), type, userId };

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
    setShowAddForm(false);

    const newCompanyRef = ref(db, `companies/${newCompany.id}`);
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
          const companyRef = ref(db, `companies/${company.id}`);
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
        <View style={styles.companyHeader}>
          <View style={styles.companyIconBadge}>
            <MaterialCommunityIcons name="office-building" size={20} color="#007bff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{item.name}</Text>
            <Text style={styles.companyType}>
              {item.type === "both" ? "Steel & Cement" : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {item.steelDetails && item.steelDetails.length > 0 && (
          <View style={styles.priceSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="bolt" size={18} color="#6b7280" />
              <Text style={styles.sectionTitle}>Steel</Text>
            </View>
            {item.steelDetails.map((s, idx) => (
              <View key={idx} style={styles.priceRow}>
                <View style={styles.priceLabel}>
                  <View style={styles.diameterBadge}>
                    <Text style={styles.diameterText}>{s.diameter}mm</Text>
                  </View>
                </View>
                <Text style={styles.priceValue}>
                  ₹{s.price} / {s.qty}kg
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.cementPrice !== undefined && (
          <View style={styles.priceSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="sack" size={18} color="#6b7280" />
              <Text style={styles.sectionTitle}>Cement</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price per unit</Text>
              <Text style={styles.priceValue}>
                ₹{item.cementPrice} / {item.cementQty} bags
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editBtn} onPress={() => startEditCompany(item)}>
          <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCompany(item)}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Create Item</Text>
            <Text style={styles.subtitle}>Manage your suppliers and pricing</Text>
          </View>
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name={showAddForm ? "close-circle-outline" : "add-circle-outline"} size={28} color="#007bff" />
          </TouchableOpacity>
        </View>

        {/* Add New Company Form */}
        {showAddForm && (
          <ScrollView style={styles.addFormScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.addContainer}>
              <View style={styles.formHeader}>
                <MaterialCommunityIcons name="briefcase-plus" size={24} color="#007bff" />
                <Text style={styles.formTitle}>Add New Item</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter company name"
                  placeholderTextColor="#9ca3af"
                  value={newCompanyName}
                  onChangeText={setNewCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={type}
                    style={styles.picker}
                    onValueChange={(v) => setType(v)}
                  >
                    <Picker.Item label="Steel Only" value="steel" />
                    <Picker.Item label="Cement Only" value="cement" />
                    <Picker.Item label="Both Steel & Cement" value="both" />
                  </Picker>
                </View>
              </View>

              {(type === "steel" || type === "both") && (
                <View style={styles.groupBox}>
                  <View style={styles.groupBoxHeader}>
                    <MaterialCommunityIcons name="iron" size={20} color="#007bff" />
                    <Text style={styles.groupTitle}>Steel Products</Text>
                  </View>
                  
                  {steelDetails.map((s, idx) => (
                    <View key={idx} style={styles.steelRow}>
                      <View style={styles.steelRowHeader}>
                        <Text style={styles.steelRowTitle}>Diameter {idx + 1}</Text>
                        {steelDetails.length > 1 && (
                          <TouchableOpacity onPress={() => removeSteelRow(idx)}>
                            <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 12 }}>
                       <TextInput
                       style={styles.inputd}
                        placeholder="diameter"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={String(s.diameter)}
                        onChangeText={(val) => updateSteelField(idx, "diameter", val)}
                      />
                      <Text style={styles.inputLabeld}>mm</Text>
                      </View>

                      <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                          <Text style={styles.inputLabel}>Price (₹)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={String(s.price)}
                            onChangeText={(val) => updateSteelField(idx, "price", val)}
                          />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={styles.inputLabel}>Quantity (kg)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={String(s.qty)}
                            onChangeText={(val) => updateSteelField(idx, "qty", val)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.addRowBtn} onPress={addSteelRow}>
                    <Ionicons name="add-circle-outline" size={20} color="#007bff" />
                    <Text style={styles.addRowBtnText}>Add Another Diameter</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(type === "cement" || type === "both") && (
                <View style={styles.groupBox}>
                  <View style={styles.groupBoxHeader}>
                    <MaterialCommunityIcons name="sack" size={20} color="#007bff" />
                    <Text style={styles.groupTitle}>Cement Products</Text>
                  </View>
                  
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Price (₹)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={cementPrice}
                        onChangeText={setCementPrice}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Quantity (bags)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={cementQty}
                        onChangeText={setCementQty}
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={addCompany}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Company List */}
        {companies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptySubtitle}>Nothing</Text>
          </View>
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item) => item.id}
            renderItem={renderCompany}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Edit Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Company</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditModalVisible(false);
                        setEditCompany(null);
                      }}
                    >
                      <Ionicons name="close-circle-outline" size={28} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  {editCompany && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Company Name</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Company Name"
                          placeholderTextColor="#9ca3af"
                          value={editCompany.name}
                          onChangeText={(text) => setEditCompany({ ...editCompany, name: text })}
                        />
                      </View>

                      {editCompany.steelDetails && editCompany.steelDetails.length > 0 && (
                        <View style={styles.groupBox}>
                          <View style={styles.groupBoxHeader}>
                            <MaterialCommunityIcons name="iron" size={20} color="#007bff" />
                            <Text style={styles.groupTitle}>Steel Products</Text>
                          </View>

                          {editCompany.steelDetails.map((s, idx) => (
                            <View key={idx} style={styles.steelRow}>
                             <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 12 }}>
                       <TextInput
                       style={styles.inputd}
                        placeholder="diameter"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={String(s.diameter)}
                        onChangeText={(val) => updateSteelField(idx, "diameter", val)}
                      />
                      <Text style={styles.inputLabeld}>mm</Text>
                      </View>

                              <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                  <Text style={styles.inputLabel}>Price (₹)</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Price"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={String(s.price)}
                                    onChangeText={(val) => {
                                      const updated = [...editCompany.steelDetails];
                                      updated[idx].price = val;
                                      setEditCompany({ ...editCompany, steelDetails: updated });
                                    }}
                                  />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                  <Text style={styles.inputLabel}>Quantity (kg)</Text>
                                  <TextInput
                                    style={styles.input}
                                    placeholder="Quantity (kg)"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={String(s.qty)}
                                    onChangeText={(val) => {
                                      const updated = [...editCompany.steelDetails];
                                      updated[idx].qty = val;
                                      setEditCompany({ ...editCompany, steelDetails: updated });
                                    }}
                                  />
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {editCompany.cementPrice !== undefined && (
                        <View style={styles.groupBox}>
                          <View style={styles.groupBoxHeader}>
                            <MaterialCommunityIcons name="sack" size={20} color="#007bff" />
                            <Text style={styles.groupTitle}>Cement Products</Text>
                          </View>
                          
                          <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                              <Text style={styles.inputLabel}>Price (₹)</Text>
                              <TextInput
                                style={styles.input}
                                placeholder="Cement Price"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={String(editCompany.cementPrice)}
                                onChangeText={(val) =>
                                  setEditCompany({ ...editCompany, cementPrice: Number(val) })
                                }
                              />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                              <Text style={styles.inputLabel}>Quantity (bags)</Text>
                              <TextInput
                                style={styles.input}
                                placeholder="Cement Qty (bags)"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={String(editCompany.cementQty)}
                                onChangeText={(val) =>
                                  setEditCompany({ ...editCompany, cementQty: Number(val) })
                                }
                              />
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setEditModalVisible(false);
                        setEditCompany(null);
                      }}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={saveEditCompany}>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.addBtnText}>Save Changes</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  addHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  addFormScroll: {
    maxHeight: 500,
  },
  addContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputLabeld: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 15,
    color: "#1f2937",
  },
   inputd: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 15,
    color: "#1f2937",
    width: '80%',
    marginRight: 8,
  },
  pickerWrapper: {
    borderRadius: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  picker: {
    height: 50,
    flex: 1,
    color: "#1f2937", 
    
  },
  groupBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  groupBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginLeft: 8,
  },
  steelRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  steelRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  steelRowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  rowInputs: {
    flexDirection: "row",
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderStyle: "dashed",
  },
  addRowBtnText: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  formActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#007bff",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelBtnText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  companyCardContainer: {
    marginBottom: 16,
  },
  companyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  companyIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  companyType: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginBottom: 12,
  },
  priceSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  priceLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  diameterBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diameterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007bff",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },
 actionButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8, gap: 12 },
  editBtn: { backgroundColor: "#4f46e5", padding: 10, borderRadius: 12, marginRight: 8 },
  deleteBtn: { backgroundColor: "#ef4444", padding: 10, borderRadius: 12 },
  



// Add these to your existing StyleSheet.create({})

// --- Modal Overlap Fix Styles ---
modalOverlay: {
  // CRITICAL: This ensures the overlay takes the whole screen AND centers the content
  flex: 1, 
  justifyContent: 'center', // Centers the content vertically
  alignItems: 'center', // Centers the content horizontally
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black to dim the background
},
modalContent: {
  // CRITICAL: Constrains the size of the modal box
  width: '90%', // Use a percentage of the screen width
  maxHeight: '80%', // Limits the height so it doesn't take the full screen
  backgroundColor: '#ffffff', // White background for the modal box
  borderRadius: 16,
  padding: 20,
  // Optional: Add a subtle shadow for depth
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 8,
},

// --- Input & Layout Improvements (Optional but Recommended) ---
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#1f2937', // Dark text color
},

emptyState: {
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
    
  },
emptySubtitle: {
    fontSize: 16,
    color: "#9ca3af",
  },


});