// Dashboard.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Linking,
  Alert,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { OrderContext } from "./Context";
import { useNavigation } from "@react-navigation/native";
import { fetchUserOrders } from "../firebaseHelpers";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const itemTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (o) =>
  (o?.items || []).reduce((s, it) => s + itemTotal(it), 0);

export default function Dashboard() {
  const navigation = useNavigation();
  const { orders, Username, setOrders } = useContext(OrderContext);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchUserOrders(setOrders);
  }, []);

  // Group by customer phone
  const groupedCustomers = useMemo(() => {
    const map = new Map();
    (orders || []).forEach((o) => {
      if (!o || !o.customerPhone) return;
      if (!map.has(o.customerPhone)) {
        map.set(o.customerPhone, {
          id: o.customerPhone,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          orders: [],
        });
      }
      map.get(o.customerPhone).orders.push(o);
    });
    return Array.from(map.values());
  }, [orders]);

  // Stats
  const totalOrders = orders?.length || 0;
  const totalSales = (orders || []).reduce(
    (sum, o) => sum + (o.finalTotal ?? orderTotal(o) ?? 0),
    0
  );
  const pending = (orders || []).filter((o) => o.status === "Pending").length;
  const totalCustomers = groupedCustomers.length;

  // Search
  const filtered = useMemo(() => {
    if (!search) return groupedCustomers;
    const s = search.toLowerCase();
    return groupedCustomers.filter(
      (c) =>
        (c.customerName || "").toLowerCase().includes(s) ||
        (c.customerPhone || "").includes(s)
    );
  }, [search, groupedCustomers]);

  // Recent customers
  const recent = [...filtered]
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 8);

  // Dashboard cards
  const dashboardData = [
    { label: "Orders", value: totalOrders, color: "#F6F8FC" , textcolor:"#616DE3"},
    { label: "Sales", value: `₹${totalSales.toLocaleString()}`, color: "#fff2f2", textcolor:"#616DE3"},
    { label: "Pending", value: pending, color: "#EDFAFA" ,textcolor:"#0694A2" },
    { label: "Customers", value: totalCustomers, color: "#FDEFEC", textcolor:"#EE4B2B" },
  ];

  // Call function
  const callCustomer = (phone) => {
    if (!phone) return Alert.alert("Error", "No phone number available");
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert("Error", "Cannot open phone dialer");
      })
      .catch((err) => console.error(err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row",justifyContent:"center",alignItems:"center" }}>
          <View
  style={{
    width: 40,
    height: 40,
    borderRadius: 5, // makes it circular
    backgroundColor: "#e0f0ff",
    justifyContent: "center",
    alignItems: "center",
    margin:5,
  }}
>
  <Ionicons name="business-outline" size={22} color="#007BFF" />
</View>

        <View>
          <Text style={styles.appName}>{Username}</Text>
        </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileScreen")}
          style={styles.logoWrapper}
        >
      <Ionicons name="person-circle" size={32} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {/* Dashboard cards */}
      <View style={styles.dashboardContainer}>
        {dashboardData.map((card, index) => (
          <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={[styles.cardLabel,{ color: card.textcolor }]}>{card.label}</Text>
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
            (sum, o) => sum + (o.finalTotal ?? orderTotal(o) ?? 0),
            0
          );
          return (
            <View style={styles.listItem}>
              <TouchableOpacity
                style={{ flexDirection: "row", flex: 1 }}
                onPress={() =>
                  navigation.navigate("CustomerDetails", {
                    customerPhone: item.customerPhone,
                  })
                }
              >
                <View style={styles.custAvatar}>
                  <Text style={styles.avatarText}>
                    {(item.customerName || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.customerInfo}>Phone: {item.customerPhone}</Text>
                  <Text style={styles.customerInfoSmall}>
                    Orders: {item.orders.length} • Total: ₹
                    {n(totalSpent).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
                  onPress={() => navigation.navigate("NewOrder", { customer: item })}
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NewOrder")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 20, fontWeight: "bold", color: "#000" },
  location: { fontSize: 14, color: "#666" },
  logoWrapper: { alignSelf: "flex-end" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  dashboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    display: "flex", // default in React Native, you can skip this
    width: 167,
    padding: 16,
    margin:4,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 4, // works only in React Native 0.71+
    flexShrink: 0,
    borderRadius: 8,
  },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#000" },
  cardLabel: { 
    textAlign: "center",
    fontFamily: "Ubuntu",   // make sure Ubuntu font is linked/loaded
    fontSize: 14,
    fontStyle: "normal",    // optional, default is 'normal'
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: -0.21,
   },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  viewAllText: { color: "#007bff" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  custAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  customerName: { fontSize: 15, fontWeight: "600" },
  customerInfo: { fontSize: 13, color: "#555" },
  customerInfoSmall: { fontSize: 12, color: "#777", marginTop: 4 },
  actionBtns: { flexDirection: "row", alignItems: "center" },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
