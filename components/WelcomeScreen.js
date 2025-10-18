import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Welcome to IndiaSteel 🏗️",
      desc: "Manage steel, cement & building materials efficiently. Track prices, companies & more!",
    },
    {
      title: "Powerful Features",
      desc: "Add, edit, and delete companies, set prices, and watch favorite companies in real-time.",
    },
    {
      title: "Get Started",
      desc: "Sign in or register now to start managing your business smarter and faster.",
    },
  ];

  const nextPage = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem("alreadyLaunched", "true");
      navigation.replace("Home");
    }
  };

  return (
    <LinearGradient colors={["#0b84ff", "#3c70ff"]} style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        contentOffset={{ x: currentPage * width, y: 0 }}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.page}>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.desc}>{page.desc}</Text>
            <TouchableOpacity style={styles.button} onPress={nextPage}>
              <Text style={styles.buttonText}>
                {index === pages.length - 1 ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.indicatorContainer}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicator,
              { opacity: i === currentPage ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { width, justifyContent: "center", alignItems: "center", padding: 30 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  desc: { color: "#e0e0ff", fontSize: 16, textAlign: "center", marginBottom: 40, lineHeight: 24 },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: "#0b84ff", fontWeight: "bold", fontSize: 16 },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 6,
  },
});
