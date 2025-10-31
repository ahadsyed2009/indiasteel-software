// HomeScreen.js
import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { OrderContext } from "./context";
import { getDatabase, ref, onValue } from "firebase/database";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {auth} from "../firebase";

dayjs.extend(isBetween);

// Helper functions
const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const itemTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (o) => (o?.items || []).reduce((s, it) => s + itemTotal(it), 0);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { orders, Username, isLoading, customers } = useContext(OrderContext);

  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  const [selectedRange, setSelectedRange] = useState("month"); // "week" | "month" | "all"
    const userId = auth.currentUser.uid;

  // 🔹 Calculate monthly estimated revenue (from Firebase)
 useEffect(() => {
  const db = getDatabase();
  const ordersRef = ref(db, `userOrders/${userId}`);

  onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const now = dayjs();
    const currentMonth = now.month();
    const currentYear = now.year();

    let total = 0;
    Object.values(data).forEach((order) => {
      const date = dayjs(order.createdAtMs || order.orderDate);
      if (date.month() === currentMonth && date.year() === currentYear) {
        total += order.finalTotal ?? orderTotal(order);
      }
    });

    setEstimatedRevenue(total);
  });
}, []);

  // 🔹 Filter Orders Based on Range
  const filteredOrders = useMemo(() => {
    const now = dayjs();

    return (orders || []).filter((o) => {
      if (!Array.isArray(o.items) || o.items.length === 0) return false;
      const date = dayjs(o.createdAtMs || o.orderDate);

      if (selectedRange === "week") {
        const startOfWeek = now.startOf("week");
        const endOfWeek = now.endOf("week");
        return date.isBetween(startOfWeek, endOfWeek, "day", "[]");
      }

      if (selectedRange === "month") {
        return date.month() === now.month() && date.year() === now.year();
      }

      return true; // all time
    });
  }, [orders, selectedRange]);

  // 🔹 Dashboard Calculations
  const totalOrders = filteredOrders.length;
  const totalSales = filteredOrders.reduce(
    (sum, o) => sum + (o.finalTotal ?? orderTotal(o)),
    0
  );
  const pending = filteredOrders.filter((o) => o.status === "Pending").length;
  const totalCustomers = customers.length;

  // 🔹 Group Customers (same as before)
  const groupedCustomers = useMemo(() => {
    const map = new Map();
    (orders || []).forEach((o) => {
      if (!o || !o.customerPhone) return;

      const customerId = o.customerPhone;
      const customerName = o.customerName || "Unknown";

      if (!map.has(customerId)) {
        map.set(customerId, {
          id: customerId,
          customerName,
          customerPhone: customerId,
          orders: [],
        });
      }
      map.get(customerId).orders.push(o);
    });
    return Array.from(map.values());
  }, [orders]);

  const recent = [...groupedCustomers]
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 4);

  // 🔹 Dashboard Data Cards
  const dashboardData = [
    {
      label: "Orders",
      value: totalOrders,
      icon: "receipt-outline",
      color: "#4F46E5",
      bgColor: "#EEF2FF",
    },
    {
      label: "Sales",
      value: `₹${totalSales.toLocaleString()}`,
      icon: "trending-up-outline",
      color: "#059669",
      bgColor: "#ECFDF5",
    },
    {
      label: "Est. Revenue  (This Month)",
      value: `₹${estimatedRevenue.toLocaleString()}`,
      icon: "calendar-outline",
      color: "#9333EA",
      bgColor: "#F3E8FF",
    },
  
    {
      label: "Customers",
      value: totalCustomers,
      icon: "people-outline",
      color: "#2678dcff",
      bgColor: "#FEE2E2",
    },
  ];

  const callCustomer = (phone) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Error", "Cannot open phone dialer. Try on a real device.");
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  // 🟣 UI Rendering
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarIcon}>
            <Ionicons name="business" size={24} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.appName}>{Username}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileScreen")}
          style={styles.profileBtn}
        >
          <Ionicons name="person-circle-outline" size={32} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 🔹 Range Selector */}
      

        {/* 🔹 Dashboard Cards */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <View style={styles.dashboardContainer}>
            {dashboardData.map((card, idx) => (
              <View key={idx} style={styles.jawDroppingCard}>
                <View style={styles.cardBody}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: card.color },
                    ]}
                  >
                    <Ionicons name={card.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.cardLabel, { color: card.color }]}>
                    {card.label}
                  </Text>
                </View>
                <Text style={styles.cardValueProminent}>{card.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 🔹 Recent Customers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Customers</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllCustomers")}>
            <View style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Customer List */}
        <View style={styles.customersList}>
          {recent.length > 0 ? (
            recent.map((item) => {
              const totalSpent = item.orders.reduce(
                (sum, o) => sum + (o.finalTotal ?? orderTotal(o)),
                0
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.customerCard}
                  onPress={() =>
                    navigation.navigate("CustomerDetails", {
                      customerPhone: item.customerPhone,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.customerLeft}>
                    <View style={styles.custAvatar}>
                      <Text style={styles.avatarText}>
                        {(item.customerName || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>
                        {item.customerName}
                      </Text>
                      <Text style={styles.customerPhone}>
                        {item.customerPhone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.addBtn]}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate("NewOrder", { customer: item });
                      }}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.callBtn]}
                      onPress={(e) => {
                        e.stopPropagation();
                        callCustomer(item.customerPhone);
                      }}
                    >
                      <Ionicons name="call" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No customers found</Text>
              <Text style={styles.emptySubtext}>Try a different filter</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NewOrder")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatarIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  greeting: { fontSize: 14, color: "#6B7280" },
  appName: { fontSize: 22, fontWeight: "800", color: "#111827" },
  profileBtn: { padding: 4 },

  // Range Selector
  rangeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: "#4F46E5",
  },
  rangeText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  rangeTextActive: {
    color: "#fff",
  },

  dashboardSection: { paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  dashboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  jawDroppingCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    justifyContent: "space-between",
    height: 120,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: { fontSize: 14, fontWeight: "700" },
  cardValueProminent: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllBtn: { flexDirection: "row", alignItems: "center", padding: 4 },
  viewAllText: { color: "#4F46E5", fontSize: 14, fontWeight: "600", marginRight: 2 },

  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  customerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  custAvatar: {
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 17, fontWeight: "700", color: "#111827" },
  customerPhone: { fontSize: 13, color: "#6B7280", marginBottom: 6 },

  actionBtns: { flexDirection: "row", gap: 10 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: { backgroundColor: "#10B981" },
  callBtn: { backgroundColor: "#3B82F6" },

  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#6B7280", marginTop: 12 },
  emptySubtext: { fontSize: 14, color: "#9CA3AF", marginTop: 4 },

  fab: {
    position: "absolute",
    bottom: 40,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
});
