// ============================================
// AI Recipe Mobile — Configuration
// ============================================

// Strapi backend URL
export const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL || 'http://localhost:1337';
export const STRAPI_API_TOKEN = process.env.EXPO_PUBLIC_STRAPI_API_TOKEN || '';

// Gemini AI
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Unsplash
export const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';

// MealDB
export const MEALDB_BASE = process.env.EXPO_PUBLIC_MEALDB_BASE || 'https://www.themealdb.com/api/json/v1/1';

// Clerk
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const CLERK_BILLING_URL = process.env.EXPO_PUBLIC_CLERK_BILLING_URL || '';

// Rate limits (display only — enforced server-side)
export const FREE_LIMITS = {
    pantryScans: 10,
    mealRecommendations: 5,
    recipeSaves: 3,
} as const;

export const PRO_LIMITS = {
    pantryScans: Infinity,
    mealRecommendations: Infinity,
    recipeSaves: Infinity,
} as const;
