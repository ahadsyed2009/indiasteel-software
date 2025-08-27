import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  FlatList,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "react-native-paper";

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previous) => !previous);

  const [orders, setOrders] = useState([]);

  // ✅ Get new order from OrdersPage when navigated back
  useEffect(() => {
    if (route.params?.newOrder) {
      setOrders((prev) => [route.params.newOrder, ...prev]);
    }
  }, [route.params?.newOrder]);

  const deleteOrder = (id) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{}}
          >
            <Entypo name="menu" size={30} />
          </TouchableOpacity>
          <View style={{ justifyContent: "flex-end", marginBottom: 5 }}>
            <Text style={styles.title}> IndiaSteel </Text>
          </View>
        </View>
        <Ionicons name="person-circle-outline" size={32} color="gray" />
      </View>

      {/* ✅ Overview */}
      <View style={styles.overviewCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={styles.overviewTitle}>Good Morning, Junaid</Text>
            <Text style={styles.subtitle}>
              {" "}
              {isEnabled ? "Month" : "Today's"} Overview
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.subtitle}>
              {" "}
              {isEnabled ? "Month" : "Today's"} Orders
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statLarge, { color: "#22C55E" }]}>₹</Text>
            <Text style={styles.subtitle}>
              {isEnabled ? "Month" : "Today's"} sales
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.subtitle}>Active Suppliers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>13</Text>
            <Text style={styles.subtitle}>Costumers</Text>
          </View>
        </View>
      </View>

      {/* ✅ Orders List */}
      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={deleteOrder}>
            <Text>{item.customer}</Text>
            
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No orders yet.</Text>}
      />

      {/* ✅ Floating Plus Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("OrdersPage")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#374151" },
  overviewCard: {
    backgroundColor: "#E0F2FE",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginTop: 0,
  },
  overviewTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#6B7280" },
  statLarge: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    width: "48%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
});
