// components/OnboardingScreen.js
import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  ScrollView,
  Image 
} from "react-native";

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const step1Anim = useRef(new Animated.Value(0)).current;
  const step2Anim = useRef(new Animated.Value(0)).current;
  const step3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger animations for a polished entrance
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

    // Animate steps sequentially
    Animated.stagger(150, [
      Animated.spring(step1Anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(step2Anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(step3Anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const StepCard = ({ icon, title, description, animValue }) => (
    <Animated.View
      style={[
        styles.stepCard,
        {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </Animated.View>
  );

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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/icon.png')} style={styles.logo} />
          </View>
          <Text style={styles.title}>Welcome to Your{'\n'}Billing Assistant</Text>
          <Text style={styles.subtitle}>
            Streamline your steel and cement business with powerful billing tools
          </Text>
        </View>

        {/* Feature Steps */}
        <ScrollView style={styles.stepsContainer}>
          <StepCard
            icon="🧾"
            title="Quick Order Creation"
            description="Create orders in 3 simple steps with auto-calculated prices"
            animValue={step1Anim}
          />
          <StepCard
            icon="👥"
            title="Smart Customer Management"
            description="Auto-fill customer details and save time on every order"
            animValue={step2Anim}
          />
          <StepCard
            icon="📈"
            title="Real-time Insights"
            description="Track sales, payments, and business growth instantly"
            animValue={step3Anim}
          />
        </ScrollView>

        {/* CTA Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
          <Text style={styles.skipText}>Ready to manage your orders</Text>
        </Animated.View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
 
  logo: {
    height: 80,
    width: 80,
    borderRadius: 20,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    paddingHorizontal: 20,
  },
  stepsContainer: {
    flex: 1,
    marginVertical: 20,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#0028FF",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  skipText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 16,
  },
});