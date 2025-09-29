// components/AllCustomers.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { OrderContext } from "./context";
import { Ionicons } from "@expo/vector-icons";


export default function AllCustomers({ navigation }) {
  const { orders } = useContext(OrderContext);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // ✅ default

  // ✅ Filter valid orders
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
      let status = "Completed";
      if (arr.some((o) => o.status === "Pending")) status = "Pending";
      else if (arr.some((o) => o.status === "In Progress")) status = "In Progress";

      return {
        phone: arr[0].customerPhone,
        name: arr[0].customerName,
        orders: arr,
        status,
      };
    });
  };

  // ✅ Apply search + filter
  const filteredCustomers = getCustomers().filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search);

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ✅ Card color by status
  const getCardColor = (status) => {
    if (status === "Pending") return "#f79d9dff";
    if (status === "In Progress") return "#f1cf99ff";
    if (status === "Completed") return "#a9f7a1a2";
    return "#f6f6f6";
  };

  // ✅ Call customer
  const callCustomer = (phone) => {
  if (!phone) {
    Alert.alert("Error", "No phone number available");
    return;
  }

  const url = `tel:${phone}`;

  Linking.openURL(url).catch(() => {
    Alert.alert("Error", "Cannot open phone dialer. Try on a real device.");
  });
};


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
                customerPhone: item.phone, // ✅ Pass phone for filtering
              })
            }
          >
            <View
              style={[styles.card, { backgroundColor: getCardColor(item.status) }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.phone}</Text>
                <Text style={styles.count}>
                  {item.orders.length} order(s) • {item.status}
                </Text>
              </View>

              {/* 📞 Call Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => callCustomer(item.phone)}
              >
                <Ionicons name="call-outline" size={20} color="#fff" />
              </TouchableOpacity>
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
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
  },
  name: { fontWeight: "700", fontSize: 16 },
  sub: { color: "#555", marginTop: 4 },
  count: { marginTop: 6, color: "#777" },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    marginLeft: 8,
  },
});
