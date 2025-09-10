// components/ProfilePage.js
import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { OrderContext } from "./Context";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ProfileScreen({ navigation }) {
     
  const { Username } = useContext(OrderContext);
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
              <Ionicons name="person-circle" size={32} color="#007BFF" />
        </View>
        <Text style={styles.username}>{Username}</Text>
        <TouchableOpacity
          style={styles.settingsBtnTop}
          onPress={() => navigation.navigate("SettingsScreen")}
        >
          <Text style={styles.settingsTextTop}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Input Card */}
     
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fafafa",
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    position: "relative",
  },

  avatarWrapper: {
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007bff",
    padding: 2,
    marginBottom: 12,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },

  settingsBtnTop: {
    position: "absolute",
    right: 20,
    top: 30,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 20,
  },

  settingsTextTop: {
    fontSize: 18,
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

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#222",
  },

  saveBtn: {
    marginTop: 24,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});