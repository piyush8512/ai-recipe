// ============================================
// AI Recipe Mobile — Profile Screen
// ============================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useClerk } from "@clerk/clerk-expo";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";
import { useUserStore } from "../../store/userStore";
import {
  FREE_LIMITS,
  CLERK_BILLING_URL,
  CLERK_PUBLISHABLE_KEY,
} from "../../constants/config";

export default function ProfileScreen() {
  const hasClerk = Boolean(CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return <ProfileContent onSignOut={useUserStore.getState().clearUser} />;
  }

  return <ProfileWithClerk />;
}

function ProfileWithClerk() {
  const { signOut } = useClerk();

  const handleClerkSignOut = async () => {
    await signOut();
  };

  return <ProfileContent onSignOut={handleClerkSignOut} />;
}

function ProfileContent({
  onSignOut,
}: {
  onSignOut: () => Promise<void> | void;
}) {
  const { user, isPro, clearUser } = useUserStore();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          await onSignOut();
          clearUser();
        },
      },
    ]);
  };

  const handleUpgrade = async () => {
    if (!CLERK_BILLING_URL) {
      Alert.alert(
        "Billing URL Missing",
        "Set EXPO_PUBLIC_CLERK_BILLING_URL in your .env to open Clerk checkout.",
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const supported = await Linking.canOpenURL(CLERK_BILLING_URL);
    if (!supported) {
      Alert.alert(
        "Cannot open checkout link",
        "Please verify your Clerk billing URL.",
      );
      return;
    }

    await Linking.openURL(CLERK_BILLING_URL);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile 👤</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={Colors.textMuted} />
              </View>
            )}
          </View>

          <Text style={styles.userName}>
            {user
              ? `${user.firstName} ${user.lastName}`.trim() || user.username
              : "Guest"}
          </Text>
          <Text style={styles.userEmail}>{user?.email || "Not signed in"}</Text>

          {/* Subscription Badge */}
          <View style={[styles.tierBadge, isPro() && styles.proBadge]}>
            <Ionicons
              name={isPro() ? "diamond" : "person"}
              size={14}
              color={isPro() ? "#F59E0B" : Colors.textSecondary}
            />
            <Text style={[styles.tierText, isPro() && styles.proText]}>
              {isPro() ? "PRO" : "FREE"}
            </Text>
          </View>
        </View>

        {/* Subscription Card */}
        {!isPro() && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={handleUpgrade}
            activeOpacity={0.85}
          >
            <View style={styles.upgradeContent}>
              <Ionicons name="diamond" size={28} color="#F59E0B" />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>
                  Unlimited scans, recipes, PDF export & more
                </Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={Colors.textInverse}
            />
          </TouchableOpacity>
        )}

        {/* Usage Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage This Month</Text>

          <View style={styles.limitRow}>
            <View style={styles.limitInfo}>
              <Ionicons
                name="camera-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.limitLabel}>Pantry Scans</Text>
            </View>
            <Text style={styles.limitValue}>
              {isPro() ? "Unlimited" : `${FREE_LIMITS.pantryScans}/mo`}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <View style={styles.limitInfo}>
              <Ionicons
                name="restaurant-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.limitLabel}>AI Recipes</Text>
            </View>
            <Text style={styles.limitValue}>
              {isPro() ? "Unlimited" : `${FREE_LIMITS.mealRecommendations}/mo`}
            </Text>
          </View>

          <View style={styles.limitRow}>
            <View style={styles.limitInfo}>
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.limitLabel}>Recipe Saves</Text>
            </View>
            <Text style={styles.limitValue}>
              {isPro() ? "Unlimited" : `${FREE_LIMITS.recipeSaves}/mo`}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {[
            { icon: "notifications-outline" as const, label: "Notifications" },
            { icon: "moon-outline" as const, label: "Appearance" },
            { icon: "help-circle-outline" as const, label: "Help & Feedback" },
            {
              icon: "document-text-outline" as const,
              label: "Terms & Privacy",
            },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.settingsRow}>
              <View style={styles.settingsInfo}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.settingsLabel}>{item.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>AI Recipe v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing["4xl"],
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: FontSizes["2xl"],
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  // User Card
  userCard: {
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  proBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  tierText: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  proText: {
    color: "#D97706",
  },

  // Upgrade Card
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.base,
    backgroundColor: Colors.darkBg,
    borderRadius: Radius.lg,
    ...Shadows.lg,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  upgradeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Section
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Limits
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  limitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  limitLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  limitValue: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.primary,
  },

  // Settings
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingsLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },

  // Sign Out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.error,
  },

  version: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
