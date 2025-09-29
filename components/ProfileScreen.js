// components/ProfilePage.js
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
import { signOut } from "firebase/auth";   // ✅ import logout

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { Username } = useContext(OrderContext);

  // Profile state
  const [bio, setBio] = useState("Welcome to IndiaSteel 🏗️ — your trusted partner in building materials...");
  const [email, setEmail] = useState("");  
  const [phone, setPhone] = useState("+91 9876543210");
  const [joined, setJoined] = useState("September 2025");

  // Edit state
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch email from Firebase auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("LoginScreen"); // 👈 send user back to login
    } catch (error) {
      console.log("Logout error: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={100} color="#007BFF" />
        <Text style={styles.username}>{Username}</Text>

        {/* Bio Section */}
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

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsBtnTop}
          onPress={() => navigation.navigate("SettingsScreen")}
        >
          <Ionicons name="settings" size={20} color="#333" />
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

      {/* Action Button */}
      <View style={{ alignItems: "center", marginTop: 10 }}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.editText}> Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ Logout Button at bottom */}
      <View style={{ alignItems: "center", marginTop: 30 }}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={16} color="#fff" />
          <Text style={styles.logoutText}> Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fafafa", paddingBottom: 40 },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    position: "relative",
  },
  username: { fontSize: 24, fontWeight: "700", color: "#222", marginTop: 8 },
  bio: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#222",
    marginTop: 6,
    width: "90%",
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  settingsBtnTop: {
    position: "absolute",
    right: 20,
    top: 20,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginTop: 12 },
  value: { fontSize: 16, color: "#222", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#222",
    marginTop: 4,
    backgroundColor: "#fafafa",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  editText: { color: "#fff", fontSize: 14, marginLeft: 6, fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545", // red
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
});
