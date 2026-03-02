// ============================================
// AI Recipe Mobile — Home Screen (Dashboard)
// ============================================

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";
import { getCategoryEmoji, getCountryFlag } from "../../constants/data";
import * as mealdbService from "../../services/mealdb.service";
import { MealDBRecipe, MealDBCategory, MealDBArea } from "../../types/recipe";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [recipeOfDay, setRecipeOfDay] = useState<MealDBRecipe | null>(null);
  const [categories, setCategories] = useState<MealDBCategory[]>([]);
  const [areas, setAreas] = useState<MealDBArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const [recipe, cats, ars] = await Promise.all([
      mealdbService.getRecipeOfTheDay(),
      mealdbService.getCategories(),
      mealdbService.getAreas(),
    ]);
    setRecipeOfDay(recipe);
    setCategories(cats);
    setAreas(ars);
    setIsLoading(false);
  };

  const openRecipe = async (name: string) => {
    await Haptics.selectionAsync();
    router.push({ pathname: "/recipe/[id]", params: { id: name } });
  };

  const openMeals = async (mode: "category" | "cuisine", value: string) => {
    await Haptics.selectionAsync();
    router.push({
      pathname: "/meals/[mode]/[value]",
      params: { mode, value },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Fresh Recipes,{"\n"}Served Daily 🔥
          </Text>
          <Text style={styles.headerSubtitle}>
            Discover thousands of recipes from around the world.
          </Text>
        </View>

        {/* ── Recipe of the Day ── */}
        {recipeOfDay && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Recipe of the Day</Text>
            </View>

            <TouchableOpacity
              style={styles.heroCard}
              activeOpacity={0.9}
              onPress={() => openRecipe(recipeOfDay.strMeal)}
            >
              <Image
                source={{ uri: recipeOfDay.strMealThumb }}
                style={styles.heroImage}
              />

              {/* Overlay badge */}
              <View style={styles.heroBadge}>
                <Ionicons name="flame" size={12} color={Colors.primary} />
                <Text style={styles.heroBadgeText}>TODAY'S SPECIAL</Text>
              </View>

              {/* Content overlay */}
              <View style={styles.heroOverlay}>
                <View style={styles.heroTags}>
                  {recipeOfDay.strCategory && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {recipeOfDay.strCategory}
                      </Text>
                    </View>
                  )}
                  {recipeOfDay.strArea && (
                    <View style={[styles.tag, styles.tagDark]}>
                      <Ionicons
                        name="globe-outline"
                        size={12}
                        color={Colors.text}
                      />
                      <Text style={[styles.tagText, styles.tagTextDark]}>
                        {recipeOfDay.strArea}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.heroTitle}>{recipeOfDay.strMeal}</Text>

                {recipeOfDay.strInstructions && (
                  <Text style={styles.heroDescription} numberOfLines={2}>
                    {recipeOfDay.strInstructions.substring(0, 120)}...
                  </Text>
                )}

                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Start Cooking</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={Colors.textInverse}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Browse by Category ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleLarge}>Browse by Category</Text>
          <Text style={styles.sectionSubtitle}>
            Find recipes that match your mood
          </Text>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.strCategory}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryCard}
                activeOpacity={0.7}
                onPress={() => openMeals("category", item.strCategory)}
              >
                <Text style={styles.categoryEmoji}>
                  {getCategoryEmoji(item.strCategory)}
                </Text>
                <Text style={styles.categoryName}>{item.strCategory}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Explore World Cuisines ── */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitleLarge}>Explore World Cuisines</Text>
          <Text style={styles.sectionSubtitle}>
            Travel the globe through food
          </Text>

          <View style={styles.cuisineGrid}>
            {areas.map((area) => (
              <TouchableOpacity
                key={area.strArea}
                style={styles.cuisineCard}
                activeOpacity={0.7}
                onPress={() => openMeals("cuisine", area.strArea)}
              >
                <Text style={styles.cuisineFlag}>
                  {getCountryFlag(area.strArea)}
                </Text>
                <Text style={styles.cuisineName}>{area.strArea}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingBottom: Spacing["3xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes["3xl"],
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: "300",
  },

  // Section
  section: {
    marginBottom: Spacing["2xl"],
  },
  lastSection: {
    marginBottom: Spacing["4xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionTitleLarge: {
    fontSize: FontSizes["2xl"],
    fontWeight: "800",
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
    fontWeight: "300",
  },

  // Hero Card (Recipe of the Day)
  heroCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: "hidden",
    ...Shadows.md,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  heroBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  heroBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  heroOverlay: {
    padding: Spacing.base,
  },
  heroTags: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  tagDark: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderDark,
  },
  tagTextDark: {
    color: Colors.text,
  },
  heroTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: "300",
    marginBottom: Spacing.md,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
  },
  heroButtonText: {
    fontSize: FontSizes.base,
    fontWeight: "700",
    color: Colors.textInverse,
  },

  // Categories
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    ...Shadows.sm,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.text,
  },

  // Cuisines
  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cuisineCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    ...Shadows.sm,
  },
  cuisineFlag: {
    fontSize: 24,
  },
  cuisineName: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.text,
  },
});
