// ============================================
// AI Recipe Mobile — Recipe Types
// ============================================

export interface Ingredient {
    item: string;
    amount: string;
    category: 'Protein' | 'Vegetable' | 'Spice' | 'Dairy' | 'Grain' | 'Other';
}

export interface InstructionStep {
    step: number;
    title: string;
    instruction: string;
    tip?: string;
}

export interface Nutrition {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
}

export interface Substitution {
    original: string;
    alternatives: string[];
}

export interface Recipe {
    id?: number;
    documentId?: string;
    title: string;
    description: string;
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
    cuisine: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    ingredients: Ingredient[];
    instructions: InstructionStep[];
    nutrition: Nutrition;
    tips: string[];
    substitutions: Substitution[];
    imageUrl?: string;
    isPublic?: boolean;
    createdAt?: string;
}

export interface RecipeSuggestion {
    title: string;
    description: string;
    matchPercentage: number;
    missingIngredients: string[];
    category: string;
    cuisine: string;
    prepTime: number;
    cookTime: number;
    servings: number;
}

// MealDB types (from public API)
export interface MealDBRecipe {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory?: string;
    strArea?: string;
    strInstructions?: string;
    strTags?: string;
}

export interface MealDBCategory {
    strCategory: string;
}

export interface MealDBArea {
    strArea: string;
}
