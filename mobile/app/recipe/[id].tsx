// ============================================
// AI Recipe Mobile — Recipe Detail Screen
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing, Radius, Shadows } from '../../constants/theme';
import { useRecipeStore } from '../../store/recipeStore';
import { useUserStore } from '../../store/userStore';
import { Recipe, Ingredient, InstructionStep } from '../../types/recipe';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentRecipe, getOrGenerate, isGenerating, saveRecipe } = useRecipeStore();
  const { user } = useUserStore();
  const [activeSection, setActiveSection] = useState<'ingredients' | 'steps' | 'nutrition'>('ingredients');

  useEffect(() => {
    if (id) getOrGenerate(id);
  }, [id]);

  const handleSave = async () => {
    if (user && currentRecipe?.recipeId) {
      await saveRecipe(user.id, currentRecipe.recipeId);
    }
  };

  if (isGenerating || !currentRecipe) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {isGenerating ? 'Generating recipe...' : 'Loading...'}
        </Text>
        <TouchableOpacity style={styles.backButtonFloat} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const recipe = currentRecipe;
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="restaurant" size={64} color={Colors.textMuted} />
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButtonFloat}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Meta */}
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metaRow}>
            {recipe.category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{recipe.category}</Text>
              </View>
            )}
            {recipe.cuisine && (
              <View style={[styles.badge, styles.badgeDark]}>
                <Ionicons name="globe-outline" size={12} color={Colors.text} />
                <Text style={[styles.badgeText, styles.badgeTextDark]}>
                  {recipe.cuisine}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{totalTime} min</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="flame-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.prepTime} min</Text>
              <Text style={styles.statLabel}>Prep</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{recipe.servings}</Text>
              <Text style={styles.statLabel}>Servings</Text>
            </View>
          </View>

          {/* Section Tabs */}
          <View style={styles.tabRow}>
            {(['ingredients', 'steps', 'nutrition'] as const).map((section) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.tab,
                  activeSection === section && styles.tabActive,
                ]}
                onPress={() => setActiveSection(section)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === section && styles.tabTextActive,
                  ]}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ingredients */}
          {activeSection === 'ingredients' && recipe.ingredients && (
            <View style={styles.sectionContent}>
              {recipe.ingredients.map((item: Ingredient, i: number) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientItem}>{item.item}</Text>
                  <Text style={styles.ingredientAmount}>{item.amount}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Steps */}
          {activeSection === 'steps' && recipe.instructions && (
            <View style={styles.sectionContent}>
              {recipe.instructions.map((step: InstructionStep, i: number) => (
                <View key={i} style={styles.stepCard}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    {step.tip && (
                      <View style={styles.tipBox}>
                        <Ionicons name="bulb-outline" size={14} color={Colors.accent} />
                        <Text style={styles.tipText}>{step.tip}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Nutrition */}
          {activeSection === 'nutrition' && recipe.nutrition && (
            <View style={styles.sectionContent}>
              <View style={styles.nutritionGrid}>
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <View key={key} style={styles.nutritionCard}>
                    <Text style={styles.nutritionValue}>{value}</Text>
                    <Text style={styles.nutritionLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text style={styles.tipsSectionTitle}>💡 Pro Tips</Text>
              {recipe.tips.map((tip: string, i: number) => (
                <View key={i} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.tipRowText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark" size={20} color={Colors.textInverse} />
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },

  // Hero
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: width * 0.75,
  },
  heroPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFloat: {
    position: 'absolute',
    top: 50,
    left: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },

  // Content
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'capitalize',
  },
  badgeDark: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderDark,
  },
  badgeTextDark: {
    color: Colors.text,
  },
  description: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '300',
    marginBottom: Spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textInverse,
  },

  // Section Content
  sectionContent: {
    marginBottom: Spacing.xl,
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  ingredientItem: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  ingredientAmount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Steps
  stepCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  stepInstruction: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#92400E',
    lineHeight: 18,
  },

  // Nutrition
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  nutritionCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
    ...Shadows.sm,
  },
  nutritionValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  nutritionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },

  // Tips
  tipsSection: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  tipsSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipRowText: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    ...Shadows.glow,
  },
  saveButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
