// components/Singup.js  (keeping your original filename)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
  if (!email || !password) {
    Alert.alert("Error", "All fields are required");
    return;
  }
  if (password.length < 6) {
    Alert.alert("Error", "Password must be at least 6 characters");
    return;
  }

  setLoading(true);
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await set(ref(db, `users/${user.uid}`), {
      email: user.email,
      createdAt: Date.now(),
      shopId: null,
      role: null,
    });

    // ✅ Don't navigate at all — the !shopId stack will mount automatically
    // Just show a success message if you want, or nothing
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      Alert.alert("Error", "Email already in use");
    } else if (error.code === "auth/invalid-email") {
      Alert.alert("Error", "Invalid email");
    } else {
      Alert.alert("Error", error.message);
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 25, color: "#222" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  button: {
    backgroundColor: "#6a11cb",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  link: { marginTop: 18, textAlign: "center", color: "#6a11cb" },
});