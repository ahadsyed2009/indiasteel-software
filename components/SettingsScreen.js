import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const SettingsOption = ({ name, icon, onPress, isLogout, gradient }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradient || ["#ffffff", "#f8f9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.optionCard, isLogout && styles.logoutCard]}
        >
          <View style={styles.optionLeft}>
            <LinearGradient
              colors={isLogout ? ["#ff6b6b", "#ee5a6f"] : ["#667eea", "#764ba2"]}
              style={styles.iconGradient}
            >
              <Ionicons name={icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.optionText, isLogout && styles.logoutText]}>
              {name}
            </Text>
          </View>
          {!isLogout && (
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={22} color="#667eea" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [aboutVisible, setAboutVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [updatesVisible, setUpdatesVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [userInfo, setUserInfo] = useState({
    email: "ahadsyed2009@gmail.com",
    shopName: "IndiaSteel",
    phone: "+91 9876543210",
    password: "mypassword123",
  });

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Do you really want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert("Logged Out", "You have been logged out successfully.");
            } catch (error) {
              console.error("Logout error: ", error);
              Alert.alert("Error", "Failed to log out. Try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const settingsOptions = [
    {
      name: "Profile",
      icon: "person-circle-outline",
      action: () => navigation.navigate("ProfileScreen"),
    },
    {
      name: "Set Price",
      icon: "pricetag-outline",
      action: () => navigation.navigate("settprice"),
    },
    {
      name: "About",
      icon: "information-circle-outline",
      action: () => setAboutVisible(true),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stunning Header */}
        <View style={styles.header}>
          <View style={styles.headerGlow} />
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
          style={styles.profileCard}
        >
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.profileAvatar}
          >
            <Text style={styles.avatarText}>
              {userInfo.shopName.substring(0, 2).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.shopName}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
          </View>
          <View style={styles.profileBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
        </LinearGradient>

        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {settingsOptions.map((item, index) => (
            <View key={item.name} style={{ marginBottom: 12 }}>
              <SettingsOption
                name={item.name}
                icon={item.icon}
                onPress={item.action}
                gradient={item.gradient}
              />
            </View>
          ))}

          {/* Logout Button */}
          <View style={{ marginTop: 20 }}>
            <SettingsOption
              name="Log Out"
              icon="log-out-outline"
              onPress={handleLogout}
              isLogout={true}
            />
          </View>
        </View>
      </ScrollView>

      {/* Updates Modal */}
      <Modal
        visible={updatesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdatesVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>🔔 Latest Updates</Text>
              <TouchableOpacity 
                style={styles.modalCloseIcon}
                onPress={() => setUpdatesVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {[
                "Real-time steel & cement price alerts with push notifications",
                "AI-powered trend predictions for smarter buying decisions",
                "Enhanced multi-company dashboard with color-coded analytics",
                "Customizable favorite companies & price watchlist",
                "Export daily & weekly price reports as PDF or Excel",
                "Offline access to last viewed prices for on-site usage",
                "Faster navigation with smooth animations & intuitive UX",
                "Dark mode & theme customization for comfortable viewing",
                "Integrated chat support with instant responses",
                "New interactive charts showing historical price trends"
              ].map((update, i) => (
                <View key={i} style={styles.updateItem}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.updateIcon}
                  >
                    <MaterialIcons name="update" size={16} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.updateText}>{update}</Text>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => Alert.alert("Check for Updates", "You are using the latest version.")}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Check for Updates</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>🏗️ IndiaSteel</Text>
              <TouchableOpacity 
                style={styles.modalCloseIcon}
                onPress={() => setAboutVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.aboutDescription}>
                IndiaSteel helps contractors, builders, and suppliers manage prices of steel, cement, and other building materials efficiently.
              </Text>

              <Text style={styles.sectionTitle}>✨ Current Features</Text>
              {[
                "Manage company prices for steel and cement",
                "Add, edit, and delete companies",
                "Quick navigation to price management",
                "Mobile-friendly and intuitive design",
                "Real-time updates and cloud sync",
              ].map((feature, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <MaterialIcons name="check-circle" size={20} color="#10b981" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { color: "#f59e0b" }]}>🚀 Coming Soon</Text>
              {[
                "Price History Charts for better analysis",
                "PDF Report Generation for daily/weekly rates",
                "Multi-user team collaboration support",
                "Customizable alerts for price changes",
                "Offline access to recently viewed prices",
              ].map((feature, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={styles.featureIconContainer}>
                    <MaterialIcons name="access-time" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <View style={styles.versionCard}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
                <TouchableOpacity onPress={() => Linking.openURL("mailto:support@indiasteel.com")}>
                  <Text style={styles.emailText}>support@indiasteel.com</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={privacyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <BlurView intensity={90} style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>🔒 Privacy</Text>
              <TouchableOpacity 
                style={styles.modalCloseIcon}
                onPress={() => setPrivacyVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyLabel}>Email Address</Text>
                <View style={styles.privacyValue}>
                  <Ionicons name="mail" size={20} color="#667eea" />
                  <Text style={styles.privacyValueText}>{userInfo.email}</Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <Text style={styles.privacyLabel}>Shop Name</Text>
                <View style={styles.privacyValue}>
                  <Ionicons name="business" size={20} color="#667eea" />
                  <Text style={styles.privacyValueText}>{userInfo.shopName}</Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <Text style={styles.privacyLabel}>Phone Number</Text>
                <View style={styles.privacyValue}>
                  <Ionicons name="call" size={20} color="#667eea" />
                  <Text style={styles.privacyValueText}>{userInfo.phone}</Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <Text style={styles.privacyLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <Ionicons name="key" size={20} color="#667eea" />
                  <TextInput
                    style={styles.passwordInput}
                    value={userInfo.password}
                    secureTextEntry={!showPassword}
                    editable={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={22} 
                      color="#667eea" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  gradientBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerGlow: {
    position: "absolute",
    top: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutCard: {
    justifyContent: "center",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a2e",
    marginLeft: 16,
  },
  logoutText: {
    color: "#ff6b6b",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    width: width - 40,
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  modalHeaderText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  modalCloseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 24,
  },
  updateItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  updateText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  aboutDescription: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 16,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  featureIconContainer: {
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
  },
  versionCard: {
    backgroundColor: "#f0f4ff",
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 15,
    color: "#667eea",
    fontWeight: "600",
  },
  privacyItem: {
    marginBottom: 24,
  },
  privacyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  privacyValue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
  },
  privacyValueText: {
    fontSize: 16,
    color: "#1a1a2e",
    marginLeft: 12,
    fontWeight: "500",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a2e",
    marginLeft: 12,
    marginRight: 12,
    fontWeight: "500",
  },
});