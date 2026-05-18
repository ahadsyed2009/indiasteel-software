// App.js
import React, { useEffect, useState, useContext } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderProvider, OrderContext } from "./components/context";
import { onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "./firebase";

// Screens
import HomeScreen from "./components/HomeScreen";
import NewOrder from "./components/NewOrder";
import CustomerDetails from "./components/CustomerDetails";
import AllCustomers from "./components/AllCustomers";
import ProfileScreen from "./components/ProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
import LoginScreen from "./components/Login";
import settprice from "./components/settprice";
import Step1 from "./components/step1";
import Step2 from "./components/step2";
import Step3 from "./components/step3";
import OnboardingScreen from "./components/OnboardingScreen";
import FirstScreen from "./components/FirstScreen";
import CreateShop from "./components/CreateShop";
import SignupScreen from "./components/Singup";
import JoinShopScreen from "./components/JoinShop";
import ManageStaffScreen from "./components/ManageStaff";
import ShopChooserScreen from "./components/ShopChooserScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(undefined); // undefined = not checked yet

  useEffect(() => {
    const init = async () => {
      try {
        const launched = await AsyncStorage.getItem("hasLaunched");
        if (launched === null) {
          await AsyncStorage.setItem("hasLaunched", "true");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (err) {
        console.log("First launch check error:", err);
        setIsFirstLaunch(false);
      }
    };

    init();

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading || isFirstLaunch === null || user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onFinish={() => setIsFirstLaunch(false)} />;
  }

  return (
    <OrderProvider>
      <MainNavigator user={user} />
    </OrderProvider>
  );
}

function MainNavigator({ user }) {
  const { shopId, isLoading } = useContext(OrderContext);
console.log("🔥 NAV STATE:", { user: !!user, shopId });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
<NavigationContainer key={user ? (shopId ? "app" : "shop") : "auth"}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // ── Unauthenticated ──────────────────────────────────────
          <>
            <Stack.Screen name="FirstScreen" component={FirstScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
             
          </>
        ) : !shopId ? (
          // ── Authenticated but no shop yet ────────────────────────
          <>
           <Stack.Screen
              name="ShopChooser"
              component={ShopChooserScreen}
              options={{ headerShown: true, title: "Welcome!" }}
            />
            <Stack.Screen name="CreateShop" component={CreateShop} />
            <Stack.Screen
              name="JoinShop"
              component={JoinShopScreen}
              options={{ headerShown: true, title: "Join a Shop" }}
            />
           
          </>
        ) : (
          // ── Authenticated + has shop ─────────────────────────────
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="AllCustomers"
              component={AllCustomers}
              options={{ headerShown: true, title: "All Customers" }}
            />
            <Stack.Screen
              name="CustomerDetails"
              component={CustomerDetails}
              options={{ headerShown: true, title: "Customer Details" }}
            />
            <Stack.Screen
              name="NewOrder"
              component={NewOrder}
              options={{ headerShown: true, title: "New Order" }}
            />
            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{ headerShown: true, title: "Profile" }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ headerShown: true, title: "Settings" }}
            />
            <Stack.Screen
              name="settprice"
              component={settprice}
              options={{ headerShown: true, title: "Set Price" }}
            />
            <Stack.Screen
              name="Step1"
              component={Step1}
              options={{ headerShown: true, title: "Step 1" }}
            />
            <Stack.Screen
              name="Step2"
              component={Step2}
              options={{ headerShown: true, title: "Step 2" }}
            />
            <Stack.Screen
              name="Step3"
              component={Step3}
              options={{ headerShown: true, title: "Step 3" }}
            />
            <Stack.Screen
              name="ManageStaff"
              component={ManageStaffScreen}
              options={{ headerShown: true, title: "Manage Staff" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}