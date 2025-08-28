import React, { createContext, useContext, useState, useEffect} from 'react';
import { Alert } from 'react-native';
import { db } from '../firebase';
import { ref, set, remove, onValue} from 'firebase/database';

const Context = createContext();

export const CotextProvider = ({ children }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState('');

  const [driverPhone, setDriverPhone] = useState('');
  const [orderType, setOrderType] = useState('cement');
  const [cementBrand, setCementBrand] = useState('');
  const [steelBrand, setSteelBrand] = useState('');
  const [cementQty, setCementQty] = useState('');
  const [steelQty, setSteelQty] = useState('');
  const [distance, setDistance] = useState('');
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);

  const resetForm = () => {
    setCustomer('');
    setPhone('');
    setDriverPhone('');
    setOrderType('cement');
    setCementBrand('');
    setSteelBrand('');
    setCementQty('');
    setSteelQty('');
    setDistance('');
    setSearchText('');
    
  };

  const getLoadingCharges = (steel, cement) => {
    return (parseInt(steel || 0) * 20) + (parseInt(cement || 0) * 10);
  };

const getTransportCharges = (steel, cement, km) => {
    const steelKg = parseInt(steel || 0); // ✅ already in KG
    const cementKg = parseInt(cement || 0) * 50;
    const totalKg = steelKg + cementKg;

    if (!km || totalKg === 0) return 0;

    let ratePer1000 = 0;
    if (km <= 4) {
      ratePer1000 = 500;
    } else if (km > 4 && km <= 10) {
      ratePer1000 = 650;
    } else {
      ratePer1000 = 850;
    }

    return Math.ceil(totalKg / 1000) * ratePer1000;
  };

  // ✅ place order and add to global orders
 

  const addCustomer = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter customer name');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
      return;
    }
    const id = Date.now().toString();
    const newCustomer = {
      id: Date.now().toString(),
      name,
      phone,
    };
    set(ref(db,'customers/' + id), newCustomer)
    .then(() => {
      setName('');
      setPhone('');
    })
    .catch((error) => { 
      Alert.alert('Error', error.message);

    });

   
  
    
  };

  const deleteCustomer = (id) => {
    remove(ref(db, 'customers/' + id))
  };

  const deleteOrder = (id) => {
   remove(ref(db, 'orders/' + id))
  };
  useEffect(() => {
    const customerRef = ref(db, "customers");
    const orderRef = ref(db, "orders");

    const unsubCustomers = onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCustomers(Object.values(data));
      } else {
        setCustomers([]);
      }
    });

    const unsubOrders = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrders(Object.values(data).reverse()); // latest first
      } else {
        setOrders([]);
      }
    });

    return () => {
      unsubCustomers();
      unsubOrders();
    };
  }, []);

  return (
    <Context.Provider
      value={{
        name,
        setName,
        phone,
        setPhone,
        customers,
        setCustomers,
        addCustomer,
        deleteCustomer,
        customer,
        setCustomer,
        driverPhone,
        setDriverPhone,
        orderType,
        setOrderType,
        cementBrand,
        setCementBrand,
        steelBrand,
        setSteelBrand,
        cementQty,
        setCementQty,
        steelQty,
        setSteelQty,
        distance,
        setDistance,
        getLoadingCharges,
        getTransportCharges,
        resetForm,
        orders,
        deleteOrder,
        searchText,
        setSearchText,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useContex = () => useContext(Context);
