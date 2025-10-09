import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [aboutVisible, setAboutVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Do you really want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert("Logged Out", "You have been logged out successfully.");
              // navigation.replace("LoginScreen");
            } catch (error) {
              console.error("Logout error: ", error);
              Alert.alert("Error", "Failed to log out. Try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const settingsOptions = [
    {
      name: "Profile",
      icon: "person-circle-outline",
      action: () => navigation.navigate("ProfileScreen"),
    },
    { name: "Notifications", icon: "notifications-outline", action: () => {} },
    {
      name: "Set Price",
      icon: "pricetag-outline",
      action: () => navigation.navigate("settprice"),
    },
    { name: "Privacy", icon: "lock-closed-outline", action: () => {} },
    {
      name: "About",
      icon: "information-circle-outline",
      action: () => setAboutVisible(true),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.card}>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.row}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={28} color="#007BFF" style={styles.iconShadow} />
            <Text style={styles.rowText}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
        ))}

        {/* Logout button */}
        <TouchableOpacity
          style={[styles.row, { justifyContent: "center", marginTop: 10 }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={28} color="#dc3545" style={styles.iconShadow} />
          <Text style={[styles.rowText, { color: "#dc3545", marginLeft: 10, fontWeight: "600" }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>IndiaSteel 🏗️</Text>

            <ScrollView style={{ marginVertical: 10 }}>
              <Text style={styles.modalText}>
                IndiaSteel helps contractors, builders, and suppliers manage prices of steel,
                cement, and other building materials efficiently. Track companies, set rates, and
                streamline your orders — all in one place.
              </Text>

              <Text style={styles.subTitle}>Features:</Text>
              {[
                "Manage company prices for steel and cement",
                "Add, edit, and delete companies",
                "Quick navigation to price management",
                "Mobile-friendly and intuitive design",
                "Real-time updates and cloud sync",
                "Customizable alerts for price changes",
              ].map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <MaterialIcons name="check-circle" size={20} color="#0b84ff" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <Text style={[styles.subTitle, { marginTop: 12 }]}>Contact & Info:</Text>
              <Text style={styles.modalText}>Version: 1.0.0</Text>
              <Text
                style={[styles.modalText, { color: "#007BFF" }]}
                onPress={() => Linking.openURL("mailto:ahadsyed2009@gmail.com")}
              >
                Email: support@indiasteel.com
              </Text>
            </ScrollView>

            <View style={{ alignItems: "center", marginTop: 10 }}>
              <Text style={{ fontSize: 12, color: "#999" }}>Powered by IndiaSteel Solutions</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setAboutVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginVertical: 20,
    marginLeft: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  rowText: {
    fontSize: 16,
    color: "#222",
    flex: 1,
    marginLeft: 14,
  },
  iconShadow: {
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
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
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007BFF",
  },
  modalText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
    color: "#222",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
    flexShrink: 1,
  },
  closeBtn: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 14,
  },
  closeBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
