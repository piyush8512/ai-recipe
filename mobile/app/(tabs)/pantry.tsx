// ============================================
// AI Recipe Mobile — Pantry Screen
// ============================================

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";
import { usePantryStore } from "../../store/pantryStore";
import { useRecipeStore } from "../../store/recipeStore";
import { useUserStore } from "../../store/userStore";
import { PantryItem } from "../../types/pantry";
import { RecipeSuggestionsCarousel } from "../../components/RecipeSuggestionsCarousel";

export default function PantryScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { items, isLoading, fetchItems, addItem, removeItem } =
    usePantryStore();
  const { generateFromIngredients, isGenerating, suggestions } =
    useRecipeStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => {
    if (user) fetchItems(user.id);
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newName.trim()) return;
    await Haptics.selectionAsync();
    await addItem(user.id, newName, newQuantity);
    setNewName("");
    setNewQuantity("");
    setShowAddForm(false);
  };

  const handleRemove = (item: PantryItem) => {
    Alert.alert("Remove Item", `Remove ${item.name} from pantry?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          removeItem(item.documentId);
        },
      },
    ]);
  };

  const handleCookFromPantry = async () => {
    if (items.length === 0) {
      Alert.alert("Empty Pantry", "Add some ingredients first!");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ingredients = items.map((i) => i.name).join(", ");
    await generateFromIngredients(ingredients);
  };

  const handleSuggestionPress = async (title: string) => {
    await Haptics.selectionAsync();
    router.push({ pathname: "/recipe/[id]", params: { id: title } });
  };

  const renderItem = ({ item }: { item: PantryItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemove(item)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Pantry 🥕</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} ingredient{items.length !== 1 ? "s" : ""} available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons
            name={showAddForm ? "close" : "add"}
            size={24}
            color={Colors.textInverse}
          />
        </TouchableOpacity>
      </View>

      {/* Add Form */}
      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Ingredient name"
            placeholderTextColor={Colors.textMuted}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity (e.g., 2 cups)"
            placeholderTextColor={Colors.textMuted}
            value={newQuantity}
            onChangeText={setNewQuantity}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
            <Text style={styles.submitText}>Add to Pantry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cook from Pantry Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.cookButton}
          onPress={handleCookFromPantry}
          activeOpacity={0.8}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Ionicons name="restaurant" size={20} color={Colors.textInverse} />
          )}
          <Text style={styles.cookButtonText}>
            {isGenerating ? "Generating Recipes..." : "Cook from Pantry"}
          </Text>
        </TouchableOpacity>
      )}

      <RecipeSuggestionsCarousel
        suggestions={suggestions}
        onPressSuggestion={handleSuggestionPress}
      />

      {/* Item List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptySubtitle}>
            Scan your fridge or add items manually
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.documentId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    justifyContent: "space-between",
    alignItems: "center",
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
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.glow,
  },

  // Add Form
  addForm: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  submitText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.textInverse,
  },

  // Cook Button
  cookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
    backgroundColor: Colors.darkBg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    ...Shadows.md,
  },
  cookButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.textInverse,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
    gap: Spacing.sm,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
  },
  itemQuantity: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },

  // Empty / Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.base,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
