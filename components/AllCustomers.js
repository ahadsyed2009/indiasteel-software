// components/AllCustomers.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { OrderContext } from "./context";
import { Ionicons } from "@expo/vector-icons";

export default function AllCustomers({ navigation }) {
  const { orders } = useContext(OrderContext);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ Ensure valid orders
  const validOrders = (orders || []).filter((o) => o && o.customerName);

  // ✅ Group orders by customer
  const getCustomers = () => {
    const map = {};
    validOrders.forEach((o, idx) => {
      const key = o.customerPhone || o.customerName;
      if (!map[key]) map[key] = [];
      map[key].push({ ...o, __tempId: idx });
    });

    return Object.values(map).map((arr) => {
      // Determine overall status
      let status = "Completed";
      if (arr.some((o) => o.status === "Pending")) status = "Pending";
      else if (arr.some((o) => o.status === "In Progress"))
        status = "In Progress";

      return {
        phone: arr[0].customerPhone || "N/A",
        name: arr[0].customerName || "N/A",
        orders: arr,
        status,
        totalOrders: arr.length,
      };
    });
  };

  // ✅ Apply search + filter
  let filteredCustomers = getCustomers().filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search);

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Sort by last order date and limit to 5
  filteredCustomers = filteredCustomers
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* 🔍 Search Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search customers"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 🔽 Filter Tabs */}
      <View style={styles.filterRow}>
        {["All", "Completed", "Pending", "In Progress"].map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterBtn,
              statusFilter === s && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter(s)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === s && styles.filterTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.phone || item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("CustomerDetails", {
                customerPhone: item.phone,
              })
            }
          >
            <View style={styles.card}>
              {/* 🟦 Avatar Circle */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name?.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              {/* 📋 Info */}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>
                  {item.totalOrders} order{item.totalOrders > 1 ? "s" : ""} •
                  Status: {item.status}
                </Text>
              </View>

              {/* ➡️ Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={{ padding: 20, color: "#666" }}>No customers</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#fff" },

  searchRow: { flexDirection: "row", marginBottom: 12 },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
  },
  filterBtnActive: {
    backgroundColor: "#007BFF",
  },
  filterText: {
    fontSize: 14,
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
