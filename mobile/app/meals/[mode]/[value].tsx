import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Colors,
  FontSizes,
  Radius,
  Shadows,
  Spacing,
} from "../../../constants/theme";
import * as mealdbService from "../../../services/mealdb.service";
import { MealDBRecipe } from "../../../types/recipe";

export default function MealsDrilldownScreen() {
  const { mode, value } = useLocalSearchParams<{
    mode: string;
    value: string;
  }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<MealDBRecipe[]>([]);

  const decodedValue = useMemo(() => decodeURIComponent(value || ""), [value]);
  const isCategory = mode === "category";

  useEffect(() => {
    const loadMeals = async () => {
      if (!decodedValue) return;
      setIsLoading(true);
      const data = isCategory
        ? await mealdbService.getMealsByCategory(decodedValue)
        : await mealdbService.getMealsByArea(decodedValue);
      setMeals(data);
      setIsLoading(false);
    };

    loadMeals();
  }, [decodedValue, isCategory]);

  const handleOpenRecipe = async (title: string) => {
    await Haptics.selectionAsync();
    router.push({ pathname: "/recipe/[id]", params: { id: title } });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{decodedValue}</Text>
          <Text style={styles.headerSubtitle}>
            {isCategory ? "Category meals" : "Cuisine meals"}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenRecipe(item.strMeal)}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.image} />
              <Text style={styles.title} numberOfLines={2}>
                {item.strMeal}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No meals found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "800",
    color: Colors.text,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  columnWrapper: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadows.sm,
  },
  image: {
    width: "100%",
    height: 120,
  },
  title: {
    padding: Spacing.sm,
    color: Colors.text,
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.base,
  },
});
