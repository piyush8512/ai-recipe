// ============================================
// AI Recipe Mobile — Recipe Service
// ============================================

import { api } from './api';
import { Recipe, RecipeSuggestion } from '../types/recipe';
import { GEMINI_API_KEY, UNSPLASH_ACCESS_KEY } from '../constants/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface StrapiResponse<T> {
    data: T;
    meta?: unknown;
}

// ─── Helpers ───────────────────────────
function normalizeTitle(title: string): string {
    return title
        .trim()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function toBlocksDescription(description: string) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: description }] }];
}

function fromBlocksDescription(description: unknown): string {
    if (typeof description === 'string') return description;
    if (!Array.isArray(description)) return '';
    return description
        .map((block: any) =>
            (block?.children || [])
                .map((child: any) => String(child?.text ?? ''))
                .join('')
        )
        .filter(Boolean)
        .join('\n\n');
}

function normalizeDbRecipe(recipe: any): Recipe {
    const cuisine = String(recipe.cuisine ?? 'other').replace('middle - eastern', 'middle-eastern');
    return {
        ...recipe,
        description: fromBlocksDescription(recipe.description),
        cuisine,
        ingredients: recipe.indgredients ?? recipe.ingredients ?? [],
        substitutions: recipe.substitions ?? recipe.substitutions ?? [],
    };
}

async function fetchRecipeImage(recipeName: string): Promise<string> {
    if (!UNSPLASH_ACCESS_KEY) return '';
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipeName)}&per_page=1&orientation=landscape`,
            { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
        );
        if (!response.ok) return '';
        const data = await response.json();
        return data.results?.[0]?.urls?.regular || '';
    } catch {
        return '';
    }
}

// ─── Get or Generate Recipe ─────────────
export async function getOrGenerateRecipe(recipeName: string) {
    const normalizedTitle = normalizeTitle(recipeName);

    // Check if recipe exists in DB
    const searchResult = await api.get<StrapiResponse<any[]>>(
        `/api/recipes?filters[title][$eqi]=${encodeURIComponent(normalizedTitle)}&populate=*`
    );

    if (searchResult.data?.length > 0) {
        return {
            recipe: normalizeDbRecipe(searchResult.data[0]),
            recipeId: searchResult.data[0].id,
            fromDatabase: true,
        };
    }

    // Generate with Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `
You are a professional chef. Generate a detailed recipe for: "${normalizedTitle}"
CRITICAL: The "title" field MUST be EXACTLY: "${normalizedTitle}"
Return ONLY a valid JSON object with this structure (no markdown):
{
  "title": "${normalizedTitle}",
  "description": "Brief description",
  "category": "breakfast|lunch|dinner|snack|dessert",
  "cuisine": "italian|chinese|mexican|indian|american|thai|japanese|other",
  "prepTime": 20,
  "cookTime": 30,
  "servings": 4,
  "ingredients": [{"item":"name","amount":"qty","category":"Protein|Vegetable|Spice|Dairy|Grain|Other"}],
  "instructions": [{"step":1,"title":"title","instruction":"details","tip":"optional tip"}],
  "nutrition": {"calories":"300","protein":"20g","carbs":"30g","fat":"10g"},
  "tips": ["tip1","tip2"],
  "substitutions": [{"original":"ingredient","alternatives":["sub1","sub2"]}]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const recipeData = JSON.parse(cleanText);
    recipeData.title = normalizedTitle;

    // Fetch image
    const imageUrl = await fetchRecipeImage(normalizedTitle);

    // Save to Strapi
    const validCategories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    const category = validCategories.includes(recipeData.category?.toLowerCase())
        ? recipeData.category.toLowerCase()
        : 'dinner';

    const createResult = await api.post<StrapiResponse<any>>('/api/recipes', {
        data: {
            title: normalizedTitle,
            description: toBlocksDescription(recipeData.description),
            cuisine: recipeData.cuisine?.toLowerCase() || 'other',
            category,
            indgredients: recipeData.ingredients,
            instructions: recipeData.instructions,
            prepTime: Number(recipeData.prepTime),
            cookTime: Number(recipeData.cookTime),
            servings: Number(recipeData.servings),
            nutrition: recipeData.nutrition,
            tips: recipeData.tips,
            substitions: recipeData.substitutions,
            imageUrl: imageUrl || '',
            isPublic: true,
        },
    });

    return {
        recipe: { ...recipeData, imageUrl },
        recipeId: createResult.data.id,
        fromDatabase: false,
    };
}

// ─── Recipes from Pantry Ingredients ────
export async function getRecipesByIngredients(ingredients: string): Promise<RecipeSuggestion[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = `
You are a chef. Given these ingredients: ${ingredients}
Suggest 5 recipes. Return ONLY a JSON array:
[{"title":"name","description":"desc","matchPercentage":85,"missingIngredients":["item"],"category":"dinner","cuisine":"italian","prepTime":20,"cookTime":30,"servings":4}]
Sort by matchPercentage descending.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
}

// ─── Save / Unsave Recipe ───────────────
export async function saveRecipe(userId: number, recipeId: number) {
    // Check if already saved
    const existing = await api.get<StrapiResponse<any[]>>(
        `/api/saved-recipes?filters[user][id][$eq]=${userId}&filters[recipe][id][$eq]=${recipeId}`
    );
    if (existing.data?.length > 0) return { alreadySaved: true };

    await api.post('/api/saved-recipes', {
        data: { user: userId, recipe: recipeId, savedAt: new Date().toISOString() },
    });
    return { alreadySaved: false };
}

export async function unsaveRecipe(userId: number, recipeId: number) {
    const existing = await api.get<StrapiResponse<any[]>>(
        `/api/saved-recipes?filters[user][id][$eq]=${userId}&filters[recipe][id][$eq]=${recipeId}`
    );
    if (existing.data?.length > 0) {
        await api.delete(`/api/saved-recipes/${existing.data[0].id}`);
    }
}

export async function getSavedRecipes(userId: number): Promise<Recipe[]> {
    const result = await api.get<StrapiResponse<any[]>>(
        `/api/saved-recipes?filters[user][id][$eq]=${userId}&populate[recipe][populate]=*&sort=savedAt:desc`
    );
    return (result.data || [])
        .map((sr: any) => sr.recipe)
        .filter(Boolean)
        .map(normalizeDbRecipe);
}
