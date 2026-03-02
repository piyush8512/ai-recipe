import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSizes,
  Radius,
  Shadows,
  Spacing,
} from "../constants/theme";
import { RecipeSuggestion } from "../types/recipe";

interface RecipeSuggestionsCarouselProps {
  suggestions: RecipeSuggestion[];
  onPressSuggestion: (title: string) => void;
}

export function RecipeSuggestionsCarousel({
  suggestions,
  onPressSuggestion,
}: RecipeSuggestionsCarouselProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={Colors.primary} />
        <Text style={styles.title}>AI Recipe Suggestions</Text>
      </View>

      <FlatList
        data={suggestions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onPressSuggestion(item.title)}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.matchPercentage}% match
              </Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.metaText}>
                  {item.prepTime + item.cookTime} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="restaurant-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.metaText}>{item.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  listContent: {
    gap: Spacing.md,
  },
  card: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
});
