import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ShopChooserScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Created! 🎉</Text>
      <Text style={styles.subtitle}>What would you like to do?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateShop")}
      >
        <Text style={styles.buttonText}>Create a New Shop</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={() => navigation.navigate("JoinShop")}
      >
        <Text style={styles.buttonText}>Join an Existing Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#222" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  button: {
    backgroundColor: "#6a11cb",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  secondary: { backgroundColor: "#2575fc" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});