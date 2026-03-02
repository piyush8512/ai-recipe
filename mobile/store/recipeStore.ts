// ============================================
// AI Recipe Mobile — Recipe Store (Zustand)
// ============================================

import { create } from 'zustand';
import { Recipe, RecipeSuggestion } from '../types/recipe';
import * as recipeService from '../services/recipe.service';

interface RecipeState {
    savedRecipes: Recipe[];
    suggestions: RecipeSuggestion[];
    currentRecipe: (Recipe & { recipeId?: number }) | null;
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;

    // Actions
    fetchSavedRecipes: (userId: number) => Promise<void>;
    getOrGenerate: (recipeName: string) => Promise<void>;
    generateFromIngredients: (ingredients: string) => Promise<void>;
    saveRecipe: (userId: number, recipeId: number) => Promise<void>;
    unsaveRecipe: (userId: number, recipeId: number) => Promise<void>;
    setCurrentRecipe: (recipe: Recipe & { recipeId?: number }) => void;
    clearSuggestions: () => void;
    clearError: () => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
    savedRecipes: [],
    suggestions: [],
    currentRecipe: null,
    isLoading: false,
    isGenerating: false,
    error: null,

    fetchSavedRecipes: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const recipes = await recipeService.getSavedRecipes(userId);
            set({ savedRecipes: recipes, isLoading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to load recipes', isLoading: false });
        }
    },

    getOrGenerate: async (recipeName) => {
        set({ isGenerating: true, error: null });
        try {
            const result = await recipeService.getOrGenerateRecipe(recipeName);
            set({
                currentRecipe: { ...result.recipe, recipeId: result.recipeId },
                isGenerating: false,
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to generate recipe', isGenerating: false });
        }
    },

    generateFromIngredients: async (ingredients) => {
        set({ isGenerating: true, error: null });
        try {
            const suggestions = await recipeService.getRecipesByIngredients(ingredients);
            set({ suggestions, isGenerating: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to get suggestions', isGenerating: false });
        }
    },

    saveRecipe: async (userId, recipeId) => {
        try {
            await recipeService.saveRecipe(userId, recipeId);
            // Refresh saved recipes
            const recipes = await recipeService.getSavedRecipes(userId);
            set({ savedRecipes: recipes });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to save recipe' });
        }
    },

    unsaveRecipe: async (userId, recipeId) => {
        try {
            await recipeService.unsaveRecipe(userId, recipeId);
            set((state) => ({
                savedRecipes: state.savedRecipes.filter((r) => r.id !== recipeId),
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to remove recipe' });
        }
    },

    setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
    clearSuggestions: () => set({ suggestions: [] }),
    clearError: () => set({ error: null }),
}));
