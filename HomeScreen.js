import React,{useState} from 'react';
import { Text, View, StyleSheet, StatusBar,TouchableOpacity,SafeAreaView,Switch } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);  
  const toggleSwitch = () => setIsEnabled(previous => !previous);
  return (
  <SafeAreaView style={styles.container}>
    <StatusBar hidden={true} />
    <View style={styles.header}>
    <View style={{flexDirection:'row'}}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={{}}><Entypo name="menu" size={30} /></TouchableOpacity>
      <View style={{ justifyContent:'flex-end', marginBottom:5,}}>
      <Text style={styles.title}> IndiaSteel </Text>
    </View>
    </View>
     <Ionicons name="person-circle-outline" size={32} color="gray" />
    </View>

      <View style={styles.overviewCard}>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}> 
          <View>
            <Text style={styles.overviewTitle}>Good Morning, Junaid</Text>
            <Text style={styles.subtitle}> {isEnabled ? "Month" : "Today's"} Overview</Text>
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
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.subtitle}> {isEnabled ? "Month" : "Today's"} Orders</Text>
          </View>
          <View style={styles.statCard} >
            <Text style={[styles.statLarge, { color: '#22C55E' }]}>
              ₹
            </Text>
            <Text style={styles.subtitle}>{isEnabled ? "Month" : "Today's"} sales</Text>
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {
   flex:1,
   padding:12,
   paddingTop:30,
 },
  header: { flexDirection: 'row',  marginBottom: 16 ,justifyContent: 'space-between',},
   title: { fontSize: 18, fontWeight: 'bold', color: '#374151', },
 overviewCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginTop:0,
  },
  overviewTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, },
   subtitle: { fontSize: 12, color: '#6B7280' },
  statLarge: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2
  },
  statValue: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  
});
