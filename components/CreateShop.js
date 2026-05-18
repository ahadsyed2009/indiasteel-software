// components/CreateShop.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../firebase";
import { ref, set, push } from "firebase/database";
import { OrderContext } from "./context";

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CreateShop() {
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    setShopId,
    setShopName: setCtxShopName,
    setUserRole,
  } = useContext(OrderContext);

  const handleCreateShop = async () => {
    if (!shopName.trim()) {
      Alert.alert("Error", "Shop name is required");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Not logged in");
      return;
    }

    setLoading(true);

    try {
      const shopRef = push(ref(db, "shops"));
      const shopId = shopRef.key;
      const inviteCode = generateInviteCode();

      console.log("🔵 Creating shop:", shopId);

      // 1. Create shop node
      await set(shopRef, {
        shopName: shopName.trim(),
        ownerId: user.uid,
        inviteCode,
        createdAt: Date.now(),
        members: {
          [user.uid]: {
            role: "admin",
            email: user.email,
            joinedAt: Date.now(),
          },
        },
      });
      console.log("✅ Shop created");

      // 2. ✅ Write inviteCode → shopId index (fixes JoinShop lookup)
      await set(ref(db, `inviteCodes/${inviteCode}`), shopId);
      console.log("✅ Invite code indexed");

      // 3. Link user → shop
      await set(ref(db, `users/${user.uid}`), {
        shopId,
        role: "admin",
        email: user.email,
      });
      console.log("✅ User linked");

      // 4. Update context
      setShopId(shopId);
      setCtxShopName(shopName.trim());
      setUserRole("admin");
      console.log("🔥 Context updated");

      Alert.alert("Shop Created 🎉", `Invite Code: ${inviteCode}`);
    } catch (error) {
      console.error("❌ ERROR:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Shop</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Shop Name"
        value={shopName}
        onChangeText={setShopName}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateShop}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Shop</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#222" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#333",
  },
  button: {
    backgroundColor: "#6a11cb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});