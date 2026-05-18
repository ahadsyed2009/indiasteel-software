// components/ManageStaff.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { ref, get, remove, set } from "firebase/database";
import { OrderContext } from "./context";

export default function ManageStaffScreen() {
  const { shopId, userRole, members } = useContext(OrderContext);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    if (!shopId) return;
    get(ref(db, `shops/${shopId}/inviteCode`)).then((snap) => {
      if (snap.exists()) setInviteCode(snap.val());
      setLoading(false);
    });
  }, [shopId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my shop on InvoX!\nUse invite code: ${inviteCode}`,
      });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleRemoveMember = (uid, email) => {
    if (!isAdmin) return;
    if (uid === auth.currentUser?.uid) {
      Alert.alert("Error", "You can't remove yourself.");
      return;
    }

    Alert.alert("Remove Member", `Remove ${email} from the shop?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            // Remove from shop members
            await remove(ref(db, `shops/${shopId}/members/${uid}`));
            // Clear user's shopId
            await set(ref(db, `users/${uid}`), {
              shopId: null,
              role: null,
              email,
            });
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Invite Code Card */}
      {isAdmin && (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Shop Invite Code</Text>
          <Text style={styles.code}>{inviteCode}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={18} color="#6a11cb" />
              <Text style={styles.codeBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Members ({members.length})</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <Ionicons
                name={item.role === "admin" ? "shield-checkmark" : "person"}
                size={20}
                color={item.role === "admin" ? "#6a11cb" : "#888"}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.memberEmail}>{item.email}</Text>
                <Text style={styles.memberRole}>{item.role}</Text>
              </View>
            </View>

            {/* Admin can remove staff (not themselves) */}
            {isAdmin && item.uid !== auth.currentUser?.uid && (
              <TouchableOpacity
                onPress={() => handleRemoveMember(item.uid, item.email)}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No members yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  codeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    elevation: 2,
  },
  codeLabel: { fontSize: 13, color: "#888", marginBottom: 6 },
  code: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 6,
    color: "#6a11cb",
    marginBottom: 16,
  },
  codeActions: { flexDirection: "row", gap: 20 },
  codeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  codeBtnText: { color: "#6a11cb", fontWeight: "600" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  memberRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    elevation: 1,
  },
  memberInfo: { flexDirection: "row", alignItems: "center" },
  memberEmail: { fontSize: 14, fontWeight: "600", color: "#333" },
  memberRole: { fontSize: 12, color: "#888", textTransform: "capitalize" },
  empty: { textAlign: "center", color: "#aaa", marginTop: 30 },
});