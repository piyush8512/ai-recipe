// ============================================
// AI Recipe Mobile — Saved Recipes Screen
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing, Radius, Shadows } from '../../constants/theme';
import { useRecipeStore } from '../../store/recipeStore';
import { useUserStore } from '../../store/userStore';
import { Recipe } from '../../types/recipe';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { savedRecipes, isLoading, fetchSavedRecipes } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) fetchSavedRecipes(user.id);
  }, [user]);

  const filteredRecipes = savedRecipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/recipe/[id]',
          params: { id: item.title },
        })
      }
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <Ionicons name="restaurant" size={32} color={Colors.textMuted} />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.cardMeta}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          {item.cuisine && (
            <View style={styles.cuisineBadge}>
              <Text style={styles.cuisineText}>{item.cuisine}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}>
              {(item.prepTime || 0) + (item.cookTime || 0)} min
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{item.servings} servings</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes 📖</Text>
        <Text style={styles.headerSubtitle}>
          {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved recipes..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matches found' : 'No saved recipes yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try a different search term'
              : 'Save recipes to build your cookbook'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => String(item.id || item.title)}
          renderItem={renderRecipeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  columnWrapper: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  // Recipe Card
  recipeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  cuisineBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  cuisineText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },

  // Empty / Loading
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.base,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
