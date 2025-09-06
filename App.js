// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrderProvider } from "./components/Context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Your screens
import HomeScreen from "./components/HomeScreen";
import NewOrder from "./components/NewOrder";
import CustomerDetails from "./components/CustomerDetails";
import AllCustomers from "./components/AllCustomers";
import ProfileScreen from "./components/ProfileScreen";
import SettingsScreen from "./components/SettingsScreen";
import LoginScreen from "./components/Login";  // 👈 Create this screen

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 to avoid flicker

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; // 👈 you can show splash screen here
  }

  return (
    <OrderProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="AllCustomers"
                component={AllCustomers}
                options={{ title: "All Customers" }}
              />
              <Stack.Screen
                name="CustomerDetails"
                component={CustomerDetails}
                options={{ title: "Customer Details" }}
              />
              <Stack.Screen
                name="NewOrder"
                component={NewOrder}
                options={{ title: "New Order" }}
              />
              <Stack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: "ProfileScreen" }}
              />
              <Stack.Screen
                name="SettingsScreen"
                component={SettingsScreen}
                options={{ title: "SettingsScreen" }}
              />
            </>
          ) : (
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </OrderProvider>
  );
}
