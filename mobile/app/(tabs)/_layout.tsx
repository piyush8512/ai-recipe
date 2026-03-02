// ============================================
// AI Recipe Mobile — Tab Navigator Layout
// ============================================

import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";
import { Colors, Fonts, Shadows } from "../../constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { CLERK_PUBLISHABLE_KEY } from "../../constants/config";

function ProtectedTabs() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <TabNavigator />;
}

function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.scanButton}>
              <Ionicons name="camera" size={28} color={Colors.textInverse} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "nutrition" : "nutrition-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const hasClerk = Boolean(CLERK_PUBLISHABLE_KEY);

  if (hasClerk) {
    return <ProtectedTabs />;
  }

  return <TabNavigator />;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    ...Shadows.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 20 : 8,
    ...Shadows.glow,
  },
});
