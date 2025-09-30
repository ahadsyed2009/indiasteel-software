// HomeScreen.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { OrderContext } from "./context";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const itemTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (o) =>
  (o?.items || []).reduce((s, it) => s + itemTotal(it), 0);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { orders, Username,isLoading } = useContext(OrderContext);
  const [search, setSearch] = useState("");

  // Group orders by customer phone
 const groupedCustomers = useMemo(() => {
  const map = new Map();
  (orders || []).forEach((o) => {
    if (!o || !o.customerPhone) return;

    const customerId = o.customerPhone;
    const customerName = o.customerName || "Unknown";

    if (!map.has(customerId)) {
      map.set(customerId, { id: customerId, customerName, customerPhone: customerId, orders: [] });
    }
    map.get(customerId).orders.push(o);
  });
  return Array.from(map.values());
}, [orders]);
  // Dashboard stats    
  // Dashboard stats    
const validOrders = (orders || []).filter(
  (o) => Array.isArray(o.items) && o.items.length > 0
);

const totalOrders = validOrders.length;
const totalSales = validOrders.reduce(
  (sum, o) => sum + (o.finalTotal ?? orderTotal(o)),
  0
);
const pending = validOrders.filter((o) => o.status === "Pending").length;
const totalCustomers = groupedCustomers.length;


  // Search filter
  const filtered = useMemo(() => {
    if (!search) return groupedCustomers;
    const s = search.toLowerCase();
    return groupedCustomers.filter(
      (c) =>
        (c.customerName || "").toLowerCase().includes(s) ||
        (c.customerPhone || "").includes(s)
    );
  }, [search, groupedCustomers]);

    // Recent customers (limit 5 for HomeScreen)
  const recent = [...filtered]
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 4); // ✅ Show only 5 on HomeScreen


  // Dashboard cards
  const dashboardData = [
    { label: "Orders", value: totalOrders, color: "#F6F8FC", textcolor: "#616DE3" },
    { label: "Sales", value: `₹${totalSales.toLocaleString()}`, color: "#fff2f2", textcolor: "#616DE3" },
    { label: "Pending", value: pending, color: "#EDFAFA", textcolor: "#0694A2" },
    { label: "Customers", value: totalCustomers, color: "#FDEFEC", textcolor: "#EE4B2B" },
  ];

  // Call customer
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

if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#007BFF" }}>Loading orders...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.avatarIcon}>
            <Ionicons name="business-outline" size={22} color="#007BFF" />
          </View>
          <Text style={styles.appName}>{Username}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Ionicons name="person-circle" size={38} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.dashboardContainer}>
        {dashboardData.map((card, idx) => (
          <View key={idx} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={[styles.cardLabel, { color: card.textcolor }]}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by customer name or phone"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {/* Recent Customers */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Customers</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AllCustomers")}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const totalSpent = item.orders.reduce(
            (sum, o) => sum + (o.finalTotal ?? orderTotal(o)),
            0
          );
          return (
            <View style={styles.listItem}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: "row" }}
                onPress={() => navigation.navigate("CustomerDetails", { customerPhone: item.customerPhone })}
              >
                <View style={styles.custAvatar}>
                  <Text style={styles.avatarText}>{(item.customerName || "?").charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.customerInfo}>Phone: {item.customerPhone}</Text>
                  <Text style={styles.customerInfoSmall}>
                    Orders: {item.orders.length} • Total: ₹{n(totalSpent).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
                  onPress={() =>
  navigation.navigate("NewOrder", {
    customer: item,

  })
}


                >
                  <Ionicons name="add-circle-outline" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#17a2b8" }]}
                  onPress={() => callCustomer(item.customerPhone)}
                >
                  <Ionicons name="call-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ color: "#666" }}>No customers yet. Add a new order.</Text>
          </View>
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NewOrder")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styles (same as before, can reuse)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  searchBar: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 12, backgroundColor: "#f9f9f9" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  viewAllText: { color: "#007bff" },
  listItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 15, marginBottom: 10, elevation: 3 },
  custAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#007bff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "bold" },
  customerName: { fontSize: 15, fontWeight: "600" },
  customerInfo: { fontSize: 13, color: "#555" },
  customerInfoSmall: { fontSize: 12, color: "#777", marginTop: 4 },
  actionBtns: { flexDirection: "row", alignItems: "center" },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#007bff", alignItems: "center", justifyContent: "center", elevation: 6 },


  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 20,   // ✅ Extra spacing top & bottom
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  avatarIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: "#e0f0ff", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10,
  },
  appName: { 
    fontSize: 22,   // ✅ Bigger font
    fontWeight: "700", 
    color: "#007BFF",
  },

  dashboardContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginBottom: 20, 
    paddingHorizontal: 4,   // ✅ Some side breathing room
  },
  card: { 
    width: "48%",   // ✅ Balanced grid
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 16,   // ✅ More rounded
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardValue: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 6 },
  cardLabel: { fontSize: 14, fontWeight: "600" },



});