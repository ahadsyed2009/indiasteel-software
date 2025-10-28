import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  // Modal is not strictly needed for this design, but kept if you need it later
} from "react-native";
import { OrderContext } from "./context";
import { Ionicons, Entypo, MaterialIcons } from "@expo/vector-icons"; // Added MaterialIcons
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

// --- Design Tokens (Consistent Branding) ---
const PRIMARY_COLOR = "#667eea"; // A vibrant gold for accent
const SECONDARY_COLOR = "#667eea"; // A clean blue for buttons
const BACKGROUND_DARK = "#fff"; // Dark background
const CARD_DARK = "#f9f9f9"; // Dark card background
const TEXT_LIGHT = "#e1e1e"; // Light text color
const TEXT_MUTED = "#B0B0B0"; // Muted text color

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { Username } = useContext(OrderContext);

  const [bio, setBio] = useState(
    "Welcome to IndiaSteel 🏗️ — your trusted partner in building materials..."
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 9876543210");
 
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
      {/* Header and 3-Dot Dropdown */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtnTop}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Entypo name="dots-three-vertical" size={20} color={TEXT_LIGHT} />
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
              <MaterialIcons name="edit" size={18} color={TEXT_DARK} />
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("SettingsScreen");
                setDropdownVisible(false);
              }}
            >
              <Ionicons name="settings" size={18} color={TEXT_DARK} />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
  style={styles.dropdownItem}
  onPress={() =>
    Alert.alert(
      "Confirm Logout",
      "Do you really want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: handleLogout, // actual logout happens here
        },
      ],
      { cancelable: true }
    )
  }
>
  <MaterialIcons name="logout" size={18} color="#dc3545" />
  <Text style={[styles.dropdownText, { color: "#dc3545" }]}>
    Logout
  </Text>
</TouchableOpacity>

          </View>
        )}
      </View>

      {/* Profile Card (Elevated Design) */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={120} color={PRIMARY_COLOR} />
        <Text style={styles.username}>{Username}</Text>
        

        {isEditing ? (
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Enter your professional bio..."
            placeholderTextColor={TEXT_MUTED}
          />
        ) : (
          <Text style={styles.bio}>{bio}</Text>
        )}
      </View>
      {/* --- Horizontal Line --- */}

      {/* Info Card (Sleeker Layout) */}
      <View style={styles.card}>
        {/* Email */}
        <View style={styles.infoRow}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="email" size={24} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={styles.infoRow}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="phone" size={24} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor={TEXT_MUTED}
              />
            ) : (
              <Text style={styles.value}>{phone}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Save Button (Conditional Rendering) */}
      {isEditing && (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <MaterialIcons name="save" size={20} color={CARD_DARK} />
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}

     
    </ScrollView>
  );
}

// --- Stylesheet for the Jaw-Dropping UI ---
const TEXT_DARK = "#222"; // Used for dropdown items (since dropdown is light)

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, backgroundColor: BACKGROUND_DARK },
  // Header Style
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: TEXT_LIGHT,
  },
  settingsBtnTop: {
    backgroundColor: CARD_DARK,
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#d3d3d3",
  },
  // Profile Card
  profileCard: {
    backgroundColor: CARD_DARK,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#e1e1e",
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#d3d3d3",
  },
  username: { fontSize: 28, fontWeight: "600", color: TEXT_LIGHT, marginTop: 15 },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  joinedText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginLeft: 5,
  },
  bio: { fontSize: 16, color: TEXT_MUTED, marginTop: 10, textAlign: "center", lineHeight: 22 },
  bioInput: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: TEXT_LIGHT,
    marginTop: 15,
    width: "100%",
    textAlignVertical: "top",
    backgroundColor: "#2A2A2A",
    minHeight: 80,
  },

  // Info Card
  card: {
    backgroundColor: CARD_DARK,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#d3d3d3",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  iconBackground: {
    backgroundColor: "#ffff",
    padding: 10,
    borderRadius: 15,
    borderColor:'#d3d3d3',
    borderWidth:1,
  },
  label: { fontSize: 13, fontWeight: "500", color: PRIMARY_COLOR },
  value: { fontSize: 17, color: TEXT_LIGHT, marginTop: 2, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    borderRadius: 8,
    padding: 8,
    fontSize: 17,
    color: TEXT_LIGHT,
    marginTop: 4,
    backgroundColor: BACKGROUND_DARK,
    width: "100%",
  },

  // Dropdown Menu
  dropdown: {
    position: "absolute",
    top: 50,
    right: 25, // Adjusted to be flush with the button's right edge
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 15,
    color: TEXT_DARK,
    marginLeft: 10,
  },

  // Save Button
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  saveText: {
    color: CARD_DARK,
    fontWeight: "700",
    fontSize: 18,
    marginLeft: 8,
  },

  // Logout Button
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545", // Red for warning/exit
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  logoutText: {
    color: TEXT_LIGHT,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});