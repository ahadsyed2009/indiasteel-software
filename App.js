import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './components/HomeScreen'
import AddCustomer from './components/AddCustomer'
import OrdersPage from './components/order'
import { CotextProvider } from './components/context';


const Drawer = createDrawerNavigator();

  export default function App() {
  return (
    <CotextProvider>
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}  // 🔥 hides the header
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="AddCustomer" component={AddCustomer} />
        <Drawer.Screen name="OrdersPage" component={OrdersPage} />
      </Drawer.Navigator>
    </NavigationContainer>
    </CotextProvider>
  );
}
