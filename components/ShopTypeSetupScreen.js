// components/ShopTypeSetupScreen.js
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SHOP_TYPES = [
  {
    id: "construction",
    name: "Construction Material Shop",
    icon: "🏗️",
    description: "Sell steel, cement, and construction materials",
    color: "#EF4444",
  },
  {
    id: "grocery",
    name: "Grocery Shop",
    icon: "🛒",
    description: "Sell groceries and food items",
    color: "#F59E0B",
  },
  {
    id: "electronics",
    name: "Electronics Shop",
    icon: "📱",
    description: "Sell electronic appliances and devices",
    color: "#3B82F6",
  },
  {
    id: "clothing",
    name: "Clothing Shop",
    icon: "👕",
    description: "Sell clothing and fashion items",
    color: "#EC4899",
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    description: "Other types of business",
    color: "#8B5CF6",
  },
];

export default function ShopTypeSetupScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectShopType = async (shopType) => {
    try {
      await AsyncStorage.setItem("shopType", shopType.id);
      if (onFinish) onFinish(shopType.id);
    } catch (err) {
      console.log("Error saving shop type:", err);
    }
  };

  const ShopTypeCard = ({ shopType, index }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.stagger(100, [
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          onPress={() => handleSelectShopType(shopType)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.shopTypeCard,
              { borderTopWidth: 4, borderTopColor: shopType.color },
            ]}
          >
            <Text style={styles.shopTypeIcon}>{shopType.icon}</Text>
            <Text style={styles.shopTypeName}>{shopType.name}</Text>
            <Text style={styles.shopTypeDescription}>
              {shopType.description}
            </Text>
            <View
              style={[
                styles.selectButton,
                { backgroundColor: shopType.color + "20", borderColor: shopType.color },
              ]}
            >
              <Text
                style={[styles.selectButtonText, { color: shopType.color }]}
              >
                Select
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What type of shop is this?</Text>
          <Text style={styles.subtitle}>
            Choose your shop type to get started with the right features
          </Text>
        </View>

        {/* Shop Type Options */}
        <ScrollView
          style={styles.shopTypesContainer}
          contentContainerStyle={styles.shopTypesContent}
          showsVerticalScrollIndicator={false}
        >
          {SHOP_TYPES.map((shopType, index) => (
            <ShopTypeCard
              key={shopType.id}
              shopType={shopType}
              index={index}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  shopTypesContainer: {
    flex: 1,
  },
  shopTypesContent: {
    paddingBottom: 20,
  },
  shopTypeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  shopTypeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  shopTypeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  shopTypeDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  selectButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
