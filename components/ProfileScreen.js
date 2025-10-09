import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { OrderContext } from "./context";
import { Ionicons, Entypo } from "@expo/vector-icons";
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
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

        {/* 3-Dot Dropdown */}
        <TouchableOpacity
          style={styles.settingsBtnTop}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Entypo name="dots-three-vertical" size={20} color="#333" />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsEditing(true);
                setDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("SettingsScreen");
                setDropdownVisible(false);
              }}
            >
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
          </View>
        )}
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

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        )}
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
  dropdown: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
});
