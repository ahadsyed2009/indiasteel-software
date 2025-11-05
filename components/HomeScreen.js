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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { OrderContext } from "./context";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const itemTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (o) => (o?.items || []).reduce((s, it) => s + itemTotal(it), 0);

// ⚡ Get timestamp for start of this month
const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { orders, Username, isLoading, customers } = useContext(OrderContext);
  const [search, setSearch] = useState("");

  // ⚡ Filter orders for current month only
  const monthStart = getMonthStart();
  const monthlyOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      if (!o || !o.createdAtMs) return false;
      return o.createdAtMs >= monthStart;
    });
  }, [orders]);

  // ⚡ Grouped Customers (for this month)
  const groupedCustomers = useMemo(() => {
    const map = new Map();
    (monthlyOrders || []).forEach((o) => {
      if (!o || !o.customerPhone) return;
      const customerId = o.customerPhone;
      const customerName = o.customerName || "Unknown";
      if (!map.has(customerId)) {
        map.set(customerId, { id: customerId, customerName, customerPhone: customerId, orders: [] });
      }
      map.get(customerId).orders.push(o);
    });
    return Array.from(map.values());
  }, [monthlyOrders]);

  const validOrders = (monthlyOrders || []).filter(
    (o) => Array.isArray(o.items) && o.items.length > 0
  );
   const validpendings = (orders || []).filter(
    (o) => Array.isArray(o.items) && o.items.length > 0
  );

  // ⚡ Monthly Stats
  const totalOrders = validOrders.length;
  const totalSales = validOrders.reduce((sum, o) => {
    const orderSum = Number(o.finalTotal) || orderTotal(o);
    return sum + orderSum;
  }, 0);
 const pending = validpendings.filter((o) => o.status === "Pending").length;
  const totalCustomers = customers.length;


  console.log("Monthly Stats Debug:", {
    totalOrders,
    totalSales,
    pending,
    totalCustomers,
    ordersCount: validOrders.length,
  });

  const filtered = useMemo(() => {
    if (!search) return groupedCustomers;
    const s = search.toLowerCase();
    return groupedCustomers.filter(
      (c) =>
        (c.customerName || "").toLowerCase().includes(s) ||
        (c.customerPhone || "").includes(s)
    );
  }, [search, groupedCustomers]);

  const recent = [...filtered]
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 4);

  // Dashboard cards now show monthly stats ⚡
  const dashboardData = [
    { 
      label: "Total Orders ", 
      value: totalOrders, 
      icon: "receipt-outline",
      color: "#4F46E5",
      bgColor: "#EEF2FF"
    },
    { 
      label: "Total Sales ", 
      value: `₹${totalSales.toLocaleString()}`, 
      icon: "trending-up-outline",
      color: "#059669",
      bgColor: "#ECFDF5"
    },
    { 
      label: "Pending ", 
      value: pending, 
      icon: "time-outline",
      color: "#F59E0B",
      bgColor: "#FEF3C7"
    },
    { 
      label: "Customers ", 
      value: totalCustomers, 
      icon: "people-outline",
      color: "#2678dcff",
      bgColor: "#FEE2E2"
    },
  ];

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")} style={styles.profileBtn}>
          <Ionicons name="person-circle-outline" size={32} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>This Month's Overview</Text>
          <View style={styles.dashboardContainer}>
            {dashboardData.map((card, idx) => (
              <View key={idx} style={styles.Card}>
                <View style={styles.cardBody}>
                  <View style={[styles.iconContainer, { backgroundColor: card.color, marginBottom: 0 }]}>
                    <Ionicons name={card.icon} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
                </View>
                <Text style={styles.cardValueProminent}>{card.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Customers</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllCustomers")}>
            <View style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        </View>

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
                    navigation.navigate("CustomerDetails", { customerPhone: item.customerPhone })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.customerLeft}>
                    <View style={styles.custAvatar}>
                      <Text style={styles.avatarText}>
                        {(item.customerName || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{item.customerName}</Text>
                      <Text style={styles.customerPhone}>{item.customerPhone}</Text>
                      <View style={styles.customerStats}>
                        <View style={styles.statBadge}>
                          <Ionicons name="cart-outline" size={12} color="#6B7280" />
                          <Text style={styles.statText}>{item.orders.length} orders</Text>
                        </View>
                      
                      </View>
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
              <Text style={styles.emptyText}>No customers found this month</Text>
              <Text style={styles.emptySubtext}>Try adding a new order</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NewOrder")} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB",
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20, // Apply horizontal padding to the scrollable content
    paddingTop: 10,
  },

  // Header Styles (Minor adjustment to padding)
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, // Increased padding
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#F9FAFB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarIcon: { 
    width: 48, // Slightly smaller
    height: 48, 
    borderRadius: 12, // More squared corners
    backgroundColor: "#EEF2FF", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 12,
  },
  greeting: {
    fontSize: 14, // Slightly larger font
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 0,
  },
  appName: { 
    fontSize: 22, // Slightly larger and bolder
    fontWeight: "800", 
    color: "#111827",
  },
  profileBtn: {
    padding: 4,
  },

  // Search Bar - New Style
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24, // Added more space below
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // Premium shadow for the search bar
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0, // Ensure consistent height
  },

  // Dashboard Section
  dashboardSection: {
    paddingBottom: 24, // Increased padding
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  dashboardContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    height:'auto',
    width:'auto',
  },

  // JAW-DROPPING CARD STYLE
  Card: { 
    width: "48%",
    backgroundColor: "#fff", // Set background to white for contrast
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    // Stronger, more lifted shadow
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    justifyContent: "space-between",
    // Fixed height for consistency
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
   
    gap: 8,
    marginBottom: 8,
    paddingBottom: 4,
  },
  iconContainer: {
    width: 32, // Slightly smaller icon container
    height: 32, 
    borderRadius: 8, 
    justifyContent: "center", 
    alignItems: "center", 
  },
  cardValueProminent: { 
    fontSize: 28, // MUCH larger value
    fontWeight: "900", // Extra bold
    color: "#111827", 
    // Added a subtle shadow to the text itself for depth
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    
  },
  cardLabel: { 
    fontSize: 14, 
    fontWeight: "700", // Bolder label
    color: "#4F46E5",
  },

  // Customers Section (Adjusted to be a simple list container)
  customersList: {
    marginBottom: 0,
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    // Moved padding from the old style into the scrollContent
    marginBottom: 16, 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#111827",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4, // Added padding for easier tap
  },
  viewAllText: { 
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 2,
  },

  // Customer Card (Minor style refinement)
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // Refined shadow for list items
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  customerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  custAvatar: { 
    width: 45, // Slightly smaller
    height: 45, 
    borderRadius: 24, 
    backgroundColor: "#4F46E5", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 16, // Increased margin
  },
  avatarText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: { 
    fontSize: 17, // Slightly larger
    fontWeight: "700", // Bolder
    color: "#111827",
    marginBottom: 2,
  },
  customerPhone: { 
    fontSize: 13, 
    color: "#6B7280",
    marginBottom: 6,
  },
  customerStats: {
    flexDirection: "row",
    gap: 14, // Increased gap
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: '#F3F4F6', // Added a subtle background for the badge
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    color: "#4B5563", // Darker text for better contrast
    fontWeight: "600",
  },

  // Action Buttons (Minor refinement)
  actionBtns: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 10,
  },
  actionBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center",
  },
  addBtn: {
    backgroundColor: "#10B981", // Green
  },
  callBtn: {
    backgroundColor: "#3B82F6", // Blue
  },

  // Empty State (Kept as is)
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },

  // FAB (Kept as is)
  fab: { 
    position: "absolute", 
    bottom: 40, // Slightly higher
    right: 24, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: "#4F46E5", 
    alignItems: "center", 
    justifyContent: "center", 
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4, // Stronger FAB shadow
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});