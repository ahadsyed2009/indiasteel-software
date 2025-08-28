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
  Modal,
  TextInput,
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Get new order from OrdersPage
  useEffect(() => {
    if (route.params?.newOrder) {
      setOrders((prev) => [route.params.newOrder, ...prev]);
    }
  }, [route.params?.newOrder]);

  const deleteOrder = (id) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
    setModalVisible(false);
  };

  const updateOrder = () => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === selectedOrder.id ? selectedOrder : o))
    );
    setIsEditing(false);
    setModalVisible(false);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder({ ...order });
    setModalVisible(true);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{}}>
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
            <Text style={styles.subtitle}>Customers</Text>
          </View>
        </View>
      </View>

      {/* ✅ Orders List */}
      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => openOrderDetails(item)}
          >
            <Card style={{ padding: 10 }}>
              <Text style={{ fontWeight: "600" }}>{item.customer}</Text>
              <Text style={{ color: "gray" }}>{item.phone}</Text>
            </Card>
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

      {/* ✅ Modal for Order Details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Edit Order" : "Order Details"}
                </Text>

                {/* Editable or Readonly fields */}
                {isEditing ? (
                  <>
                   <Text>Customers Name:</Text>
                    <TextInput
                      style={styles.input}
                      title="Customers name"
                      value={selectedOrder.customer}
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, customer: text })
                      }
                    />
                    <Text> Customers phone no:</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedOrder.phone}
                      keyboardType="phone-pad"
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, phone: text })
                      }
                    />
                    <Text>Drivers phone no:</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedOrder.driverPhone}
                      keyboardType="phone-pad"
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, driverPhone: text })
                      }
                    />
                    <Text>Order Type:</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedOrder.orderType}
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, orderType: text })
                      }
                    />

                  <Text>Steel Brand:</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedOrder.steelBrand}
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, steelBrand: text })
                      }
                    />

                    <Text>Cement Brand:</Text>
                    <TextInput
                      style={styles.input}
                      value={selectedOrder.cementBrand}
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, cementBrand: text })
                      }
                    />
                    
                    <Text>Cement Qty:</Text>
                    <TextInput
                      style={styles.input}
                      value={String(selectedOrder.cementQty)}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, cementQty: text })
                      }
                    />
                    <Text>Steel Qty:</Text>
                    <TextInput
                      style={styles.input}
                      value={String(selectedOrder.steelQty)}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setSelectedOrder({ ...selectedOrder, steelQty: text })
                      }
                    />
                  </>
                ) : (
                  <>
                    <Text>👤 Customer: {selectedOrder.customer}</Text>
                    <Text>📞 Phone: {selectedOrder.phone}</Text>
                    <Text>🚚 Driver Phone: {selectedOrder.driverPhone}</Text>
                    <Text>🏗️ Type: {selectedOrder.orderType}</Text>
                    {selectedOrder.cementQty ? (
                      <Text>🧱 Cement: {selectedOrder.cementQty} ({selectedOrder.cementBrand})</Text>
                    ) : null}
                    {selectedOrder.steelQty ? (
                      <Text>🔩 Steel: {selectedOrder.steelQty} ({selectedOrder.steelBrand})</Text>
                    ) : null}
                    <Text>📍 Distance: {selectedOrder.distance} km</Text>
                    <Text>💰 Loading: ₹{selectedOrder.loading}</Text>
                    <Text>🚛 Transport: ₹{selectedOrder.transport}</Text>
                  </>
                )}

                {/* Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 20,
                    justifyContent: "space-between",
                  }}
                >
                  {isEditing ? (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: "#007AFF" }]}
                      onPress={updateOrder}
                    >
                      <Text style={{ color: "white" }}>Save</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: "orange" }]}
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={{ color: "white" }}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "red" }]}
                    onPress={() => deleteOrder(selectedOrder.id)}
                  >
                    <Text style={{ color: "white" }}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "gray" }]}
                    onPress={() => {
                      setModalVisible(false);
                      setIsEditing(false);
                    }}
                  >
                    <Text style={{ color: "white" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, paddingTop: 30 },
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  card: { marginBottom: 10, borderRadius: 10 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalBtn: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "30%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 8,
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: "white",
  },
});
