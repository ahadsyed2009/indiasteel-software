import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { loginUser, registerUser } from "../authService";
import { OrderContext } from "./context";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const { Username, setUsername } = useContext(OrderContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        placeholder="Shop Name"
        value={Username}
        onChangeText={setUsername} // auto-saves now
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      {/* Login Button */}
      <TouchableOpacity
        onPress={() => loginUser(email, password)}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={["#6a11cb", "#2575fc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        onPress={() => registerUser(email, password)}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={["#2575fc", "#6a11cb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Register</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  buttonWrapper: {
    width: "100%",
    marginVertical: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});