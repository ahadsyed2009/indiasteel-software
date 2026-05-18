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
import { ref, get, set } from "firebase/database";
import { OrderContext } from "./context";

export default function JoinShopScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { setShopId, setShopName, setUserRole } = useContext(OrderContext);

  const handleJoin = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Not logged in");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Look up shopId from inviteCodes index
      const codeSnap = await get(ref(db, `inviteCodes/${trimmedCode}`));

      if (!codeSnap.exists()) {
        Alert.alert("Invalid Code", "No shop found with that invite code.");
        setLoading(false);
        return;
      }

      const matchedShopId = codeSnap.val();

      // Step 2: Fetch that specific shop's data
      const shopSnap = await get(ref(db, `shops/${matchedShopId}`));
      if (!shopSnap.exists()) {
        Alert.alert("Error", "Shop data not found. Please contact your admin.");
        setLoading(false);
        return;
      }

      const matchedShopData = shopSnap.val();

      // Step 3: Check if already a member
      const memberSnap = await get(
        ref(db, `shops/${matchedShopId}/members/${user.uid}`)
      );
      if (memberSnap.exists()) {
        Alert.alert("Already Joined", "You're already a member of this shop.");
        setLoading(false);
        return;
      }

      // Step 4: Add user as staff member in shop
      await set(ref(db, `shops/${matchedShopId}/members/${user.uid}`), {
        role: "staff",
        email: user.email,
        joinedAt: Date.now(),
      });

      // Step 5: Link user → shopId
      await set(ref(db, `users/${user.uid}`), {
        shopId: matchedShopId,
        role: "staff",
        email: user.email,
      });

      // Step 6: Update context → triggers navigation
      setShopId(matchedShopId);
      setShopName(matchedShopData.shopName || "");
      setUserRole("staff");

      Alert.alert(
        "Joined! 🎉",
        `You've joined "${matchedShopData.shopName}" as staff.`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Shop</Text>
      <Text style={styles.subtitle}>
        Enter the invite code shared by your shop admin.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. A3XZ9K"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        maxLength={10}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleJoin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Join Shop</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#222" },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 25 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: "center",
    backgroundColor: "#fff",
    color: "#333",
  },
  button: {
    backgroundColor: "#6a11cb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});