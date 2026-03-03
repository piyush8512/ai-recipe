
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
  Modal,
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
import { HomeHeader } from "@/components/home/Header";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [recipeOfDay, setRecipeOfDay] = useState<MealDBRecipe | null>();
  const [categories, setCategories] = useState<MealDBCategory[]>([]);
  const [areas, setAreas] = useState<MealDBArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New state for the Cuisine Modal
  const [isCuisineModalVisible, setIsCuisineModalVisible] = useState(false);

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
    // Close modal if it's open before navigating
    if (isCuisineModalVisible) setIsCuisineModalVisible(false);
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

  // Get only top 7 areas for the horizontal list
  const topCuisines = areas.slice(0, 7);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <HomeHeader
          userName="Jenny"
          onSearchChange={(text) => console.log(text)}
          onFilterPress={() => {}}
        />

        {/* ── Browse by Category ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleLarge}>Categories</Text>
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

              <View style={styles.heroBadge}>
                <Ionicons name="flame" size={12} color={Colors.primary} />
                <Text style={styles.heroBadgeText}>TODAY'S SPECIAL</Text>
              </View>

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

        {/* ── Explore World Cuisines (Top Chefs Style) ── */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionTitleLarge}>Explore World Cuisines</Text>
            <TouchableOpacity onPress={() => setIsCuisineModalVisible(true)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={topCuisines}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.strArea}
            contentContainerStyle={styles.cuisineHorizontalList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cuisineCircleCard}
                activeOpacity={0.7}
                onPress={() => openMeals("cuisine", item.strArea)}
              >
                <View style={styles.cuisineCircle}>
                  <Text style={styles.cuisineFlagLarge}>
                    {getCountryFlag(item.strArea)}
                  </Text>
                </View>
                <Text style={styles.cuisineCircleName} numberOfLines={1}>
                  {item.strArea}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {recipeOfDay && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Popular</Text>
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

              <View style={styles.heroBadge}>
                <Ionicons name="flame" size={12} color={Colors.primary} />
                <Text style={styles.heroBadgeText}>TODAY'S SPECIAL</Text>
              </View>

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
      </ScrollView>

      {/* ── See All Cuisines Modal ── */}
      <Modal
        visible={isCuisineModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCuisineModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Cuisines</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsCuisineModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
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
          </ScrollView>
        </SafeAreaView>
      </Modal>
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

  // Section
  section: {
    marginBottom: Spacing["2xl"],
    marginTop: Spacing.xl,
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
  sectionHeaderBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    paddingHorizontal: Spacing.lg,
    color: Colors.text,
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
  seeAllText: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textMuted,
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
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
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

  // Explore Cuisines (Horizontal Circle List)
  cuisineHorizontalList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  cuisineCircleCard: {
    alignItems: "center",
    width: 72,
    gap: Spacing.sm,
  },
  cuisineCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceElevated, // Light gray color from image
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cuisineFlagLarge: {
    fontSize: 32,
  },
  cuisineCircleName: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },

  // Cuisines Grid (Used in Modal)
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: Colors.text,
  },
  modalCloseButton: {
    padding: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
  },
  modalScrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
});
