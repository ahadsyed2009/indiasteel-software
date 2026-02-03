// App.js
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderProvider } from "./components/context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const launchedBefore = await AsyncStorage.getItem("hasLaunched");
        if (launchedBefore === null) {
          await AsyncStorage.setItem("hasLaunched", "true");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (err) {
        console.log("Error checking first launch:", err);
      }

      // Firebase Auth listener
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return unsubscribe;
    };

    initializeApp();
  }, []);

  if (loading || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  // Show onboarding if first launch
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
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
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
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
          
