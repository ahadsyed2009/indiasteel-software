// components/NewOrder.js - FULL CODE
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { OrderContext } from "./context";
import { saveUserOrder } from "../firebaseHelpers";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

const n = (v) => (typeof v === "number" ? v : Number(v) || 0);
const lineTotal = (it) => n(it.itemQty) * n(it.itemPrice);
const orderTotal = (items) => (items || []).reduce((s, it) => s + lineTotal(it), 0);

export default function NewOrder({ navigation, route }) {
  const { orders, setOrders, companies = [] } = useContext(OrderContext);
  const routeCustomer = route?.params?.customer;
  const orderToEdit = route?.params?.orderToEdit;

  const [customerName, setCustomerName] = useState(orderToEdit?.customerName || routeCustomer?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(orderToEdit?.customerPhone || routeCustomer?.customerPhone || "");
  const [place, setPlace] = useState(orderToEdit?.place || "");
  const [driverName, setDriverName] = useState(orderToEdit?.driverName || "");
  const [transport, setTransport] = useState(orderToEdit?.transport ? String(orderToEdit.transport) : "");
  const [paymentMethod, setPaymentMethod] = useState(orderToEdit?.paymentMethod || "");
  const [items, setItems] = useState(orderToEdit?.items?.length ? orderToEdit.items.map(i => ({ ...i })) : []);
  const [isPaid, setIsPaid] = useState(orderToEdit?.isPaid || false);

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (routeCustomer) {
      const customerOrders = (orders || [])
        .filter(o => o.customerPhone === routeCustomer.customerPhone)
        .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      const lastOrder = customerOrders[0];
      setCustomerName(routeCustomer.customerName || "");
      setCustomerPhone(routeCustomer.customerPhone || "");
      if (lastOrder) {
        setPlace(lastOrder.place || "");
        setTransport(lastOrder.transport ? String(lastOrder.transport) : "");
        setDriverName(lastOrder.driverName || "");
        setPaymentMethod(lastOrder.paymentMethod || "");
      }
    }
  }, [routeCustomer, orders]);

  const submit = () => {
    if (!customerName || !customerPhone || !place || !paymentMethod || items.length === 0) {
      return Alert.alert("Error", "Please fill all details before placing the order");
    }

    const subtotal = orderTotal(items);
    const transportCost = n(transport);
    const finalTotal = subtotal + transportCost;

    if (orderToEdit) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToEdit.id
            ? { 
                ...o, 
                customerName, 
                customerPhone, 
                items, 
                place, 
                driverName, 
                paymentMethod, 
                transport: transportCost, 
                subtotal, 
                finalTotal, 
                createdAtMs: o.createdAtMs || Date.now(), 
                status: o.status, 
                isPaid 
              }
            : o
        )
      );
      saveUserOrder({ 
        ...orderToEdit, 
        customerName, 
        customerPhone, 
        items, 
        place, 
        driverName, 
        paymentMethod, 
        transport: transportCost, 
        subtotal, 
        finalTotal, 
        createdAtMs: orderToEdit.createdAtMs || Date.now(), 
        status: orderToEdit.status, 
        isPaid 
      }).catch((err) => Alert.alert("Firebase Error", err.message));
    } else {
      const newOrder = {
        id: Date.now().toString(),
        customerName,
        customerPhone,
        items,
        place,
        driverName,
        paymentMethod,
        transport: transportCost,
        subtotal,
        finalTotal,
        createdAtMs: Date.now(),
        status: "Pending",
        isPaid,
      };
      setOrders((prev) => [...prev, newOrder]);
      saveUserOrder(newOrder).catch((err) => Alert.alert("Firebase Error", err.message));
    }
    navigation.goBack();
  };

const Stepper = () => {
  const steps = ["Items", "Customer", "Review"];
  return (
    <View style={styles.stepperContainer}>
      {steps.map((label, index) => {
        const stepIndex = index + 1;
        const isActive = step >= stepIndex;
        const isCompleted = step > stepIndex;

        return (
          <React.Fragment key={index}>
            {/* Step Circle + Label */}
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.activeCircle,
                  isCompleted && styles.completedCircle,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[styles.stepNumber, isActive && styles.activeStepNumber]}
                  >
                    {stepIndex}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, isActive && styles.activeLabel]}>
                {label}
              </Text>
            </View>

            {/* Connector: only between steps */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  step > stepIndex && styles.completedConnector,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};



  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.keyboardView} 
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerSubtitle}>
            {step === 1 ? "Add your order items" : step === 2 ? "Enter customer information" : "Review order details"}
          </Text>
        </View>

        <Stepper />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <Step1
              items={items}
              setItems={setItems}
              companies={companies}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              place={place}
              setPlace={setPlace}
              transport={transport}
              setTransport={setTransport}
              driverName={driverName}
              setDriverName={setDriverName}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3
              items={items}
              customerName={customerName}
              customerPhone={customerPhone}
              place={place}
              transport={transport}
              driverName={driverName}
              paymentMethod={paymentMethod}
              orderToEdit={orderToEdit}
              onBack={() => setStep(2)}
              onSubmit={submit}
            />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  stepperContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: "#FFFFFF",
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
},

stepItem: {
  alignItems: "center",
  width: 60, // width of each step block
},

stepConnector: {
  flex: 1,
  height: 2,
  backgroundColor: "#E5E7EB",
  alignSelf: "center",
  marginHorizontal: 2,
},
completedConnector: {
  backgroundColor: "#10B981",
},



  stepWrapper: {
    alignItems: "center",
    width: 70,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCircle: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    elevation: 3,
    shadowOpacity: 0.2,
  },
  completedCircle: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
    elevation: 3,
    shadowOpacity: 0.2,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  activeStepNumber: {
    color: "#FFFFFF",
  },
  checkmark: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
  },
  activeLabel: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: "#E5E7EB",
    position: "absolute",
    top: 18,
    left: "50%",
    marginLeft: 18,
    zIndex: 0,
  },
  completedConnector: {
    backgroundColor: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },



stepperContainer: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: "#FFFFFF",
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
},

stepWrapper: {
  alignItems: "center",
  width: 60, // fixed width for step block
},

stepCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#E5E7EB",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: "#E5E7EB",
  elevation: 2,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},

activeCircle: {
  backgroundColor: "#3B82F6",
  borderColor: "#3B82F6",
  elevation: 3,
  shadowOpacity: 0.2,
},

completedCircle: {
  backgroundColor: "#10B981",
  borderColor: "#10B981",
  elevation: 3,
  shadowOpacity: 0.2,
},

stepNumber: {
  fontSize: 15,
  fontWeight: "600",
  color: "#9CA3AF",
},

activeStepNumber: {
  color: "#FFFFFF",
},

checkmark: {
  fontSize: 16,
  color: "#FFFFFF",
  fontWeight: "bold",
},

stepLabel: {
  marginTop: 6,
  fontSize: 11,
  fontWeight: "500",
  color: "#9CA3AF",
  textAlign: "center",
},

activeLabel: {
  color: "#3B82F6",
  fontWeight: "600",
},

stepConnector: {
  flex: 1, // takes remaining horizontal space
  height: 2,
  backgroundColor: "#E5E7EB",
  alignSelf: "center",
  marginHorizontal: 2,
},

completedConnector: {
  backgroundColor: "#10B981",
},





});