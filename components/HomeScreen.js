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
const orderTotal = (o) =>
  (o?.items || []).reduce((s, it) => s + itemTotal(it), 0);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { orders, Username, isLoading } = useContext(OrderContext);
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

  // Recent customers (limit 4 for HomeScreen)
  const recent = [...filtered]
    .sort((a, b) => {
      const lastA = Math.max(...a.orders.map((o) => o.createdAtMs || 0));
      const lastB = Math.max(...b.orders.map((o) => o.createdAtMs || 0));
      return lastB - lastA;
    })
    .slice(0, 4);

  // Dashboard cards
  const dashboardData = [
    { 
      label: "Total Orders", 
      value: totalOrders, 
      icon: "receipt-outline",
      color: "#4F46E5",
      bgColor: "#EEF2FF"
    },
    { 
      label: "Total Sales", 
      value: `₹${totalSales.toLocaleString()}`, 
      icon: "trending-up-outline",
      color: "#059669",
      bgColor: "#ECFDF5"
    },
    { 
      label: "Pending", 
      value: pending, 
      icon: "time-outline",
      color: "#F59E0B",
      bgColor: "#FEF3C7"
    },
    { 
      label: "Customers", 
      value: totalCustomers, 
      icon: "people-outline",
      color: "#2678dcff",
      bgColor: "#FEE2E2"
    },
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

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

        {/* Dashboard Cards */}
        <View style={styles.dashboardSection}>
          <Text style={styles.dashboardTitle}>Overview</Text>
          <View style={styles.dashboardContainer}>
            {dashboardData.map((card, idx) => (
              <View key={idx} style={[styles.card, { backgroundColor: card.bgColor }]}>
                <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                  <Ionicons name={card.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.cardValue}>{card.value}</Text>
                <Text style={[styles.cardLabel, { color: card.color }]}>{card.label}</Text>
              </View>
            ))}
          </View>
        </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Recent Customers Section */}
        <View style={styles.customersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Customers</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllCustomers")}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          </View>
            

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
                  onPress={() => navigation.navigate("CustomerDetails", { customerPhone: item.customerPhone })}
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
                        <View style={styles.statBadge}>
                          <Ionicons name="cash-outline" size={12} color="#6B7280" />
                          <Text style={styles.statText}>₹{n(totalSpent).toLocaleString()}</Text>
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
              <Text style={styles.emptyText}>No customers yet</Text>
              <Text style={styles.emptySubtext}>Start by creating your first order</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
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

  // Header Styles
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: "#EEF2FF", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 12,
  },
  greeting: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  appName: { 
    fontSize: 20,
    fontWeight: "700", 
    color: "#111827",
  },
  profileBtn: {
    padding: 4,
  },

  // Dashboard Section
  dashboardSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
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
  },
  card: { 
    width: "48%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardValue: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#111827", 
    marginBottom: 4,
  },
  cardLabel: { 
    fontSize: 13, 
    fontWeight: "600",
  },

  // Customers Section
  customersSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
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
  },
  viewAllText: { 
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },

  // Customer Card
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  customerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  custAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "#4F46E5", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 12,
  },
  avatarText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 18,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: { 
    fontSize: 16, 
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  customerPhone: { 
    fontSize: 14, 
    color: "#6B7280",
    marginBottom: 6,
  },
  customerStats: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Action Buttons
  actionBtns: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 8,
  },
  actionBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center",
  },
  addBtn: {
    backgroundColor: "#10B981",
  },
  callBtn: {
    backgroundColor: "#3B82F6",
  },

  // Empty State
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

  // FAB
  fab: { 
    position: "absolute", 
    bottom: 24, 
    right: 24, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: "#4F46E5", 
    alignItems: "center", 
    justifyContent: "center", 
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});