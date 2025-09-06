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
import { OrderContext } from "./Context";

export default function AllCustomers({ navigation }) {
  const { orders } = useContext(OrderContext);
  const [search, setSearch] = useState("");

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

  // ✅ Apply search filter
  const filteredCustomers = getCustomers().filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  // ✅ Card color by status
  const getCardColor = (status) => {
    if (status === "Pending") return "#ffe5e5";
    if (status === "In Progress") return "#fff3e0";
    if (status === "Completed") return "#e0f7e9";
    return "#f6f6f6";
  };

  // ✅ Call customer
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
                <Text style={styles.count}>{item.orders.length} order(s)</Text>
              </View>

              {/* 📞 Call Button */}
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => callCustomer(item.phone)}
              >
                <Text style={styles.callBtnText}>📞</Text>
                
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
  callBtn: {
    backgroundColor: "#17a2b8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 12,
  },
  callBtnText: { color: "#fff", fontWeight: "600",borderRadius:10 },
});