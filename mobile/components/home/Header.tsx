import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Spacing, Radius, Shadows } from "../../constants/theme";

interface HomeHeaderProps {
  userName: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
  onNotificationPress?: () => void;
}

export const HomeHeader = ({
  userName,
  onSearchChange,
  onFilterPress,
  onNotificationPress,
}: HomeHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Top Row: Profile & Notification */}
      <View style={styles.topRow}>
        <View style={styles.userSection}>
    
          <View>
            <Text style={styles.welcomeText}>Hello, {userName}!</Text>
            <Text style={styles.subtitleText}>Check Amazing Recipes..</Text>
          </View>
        </View>

        <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onNotificationPress}
            activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Search & Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder="Search Any Recipe.."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            onChangeText={onSearchChange}
          />
        </View>
{/*         
        <TouchableOpacity 
            style={styles.filterButton} 
            onPress={onFilterPress}
            activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color={Colors.text} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius["2xl"],
    borderBottomRightRadius: Radius["2xl"],
    ...Shadows.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeText: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  subtitleText: {
    fontSize: FontSizes.sm,
    color: "rgba(255, 255, 255, 0.8)",
  },
  iconButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.base,
    color: Colors.text,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});