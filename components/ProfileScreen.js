import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { OrderContext } from "./context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { Username } = useContext(OrderContext);

  const [bio, setBio] = useState(
    "Welcome to IndiaSteel 🏗️ — your trusted partner in building materials..."
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 9876543210");
  const [joined, setJoined] = useState("September 2025");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  const handleSave = () => setIsEditing(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state will redirect automatically to Login
    } catch (error) {
      console.log("Logout error: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={100} color="#007BFF" />
        <Text style={styles.username}>{Username}</Text>

        {isEditing ? (
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        ) : (
          <Text style={styles.bio}>{bio}</Text>
        )}

        {/* Settings button */}
        <TouchableOpacity
          style={styles.settingsBtnTop}
          onPress={() => navigation.navigate("SettingsScreen")}
        >
          <Ionicons name="settings" size={20} color="#333" />
        </TouchableOpacity>

        {/* Edit button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Ionicons
            name={isEditing ? "checkmark" : "pencil"}
            size={16}
            color="#fff"
          />
          <Text style={styles.editText}>
            {isEditing ? " Save" : " Edit Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        <Text style={styles.label}>Phone</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone}</Text>
        )}

        <Text style={styles.label}>Joined</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={joined}
            onChangeText={setJoined}
          />
        ) : (
          <Text style={styles.value}>{joined}</Text>
        )}
      </View>

      {/* Logout Button */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={16} color="#fff" />
          <Text style={styles.logoutText}> Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f9f9f9" },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 20,
    position: "relative",
  },
  username: { fontSize: 22, fontWeight: "700", color: "#222", marginTop: 8 },
  bio: { fontSize: 14, color: "#555", marginTop: 6, textAlign: "center" },
  bioInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    fontSize: 14,
    color: "#222",
    marginTop: 6,
    width: "100%",
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  editText: { color: "#fff", fontSize: 14, marginLeft: 6, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 12 },
  value: { fontSize: 16, color: "#222", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    color: "#222",
    marginTop: 4,
    backgroundColor: "#fafafa",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  settingsBtnTop: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
  },
});
