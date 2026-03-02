// ============================================
// AI Recipe Mobile — MealDB Service
// ============================================

import { MEALDB_BASE } from '../constants/config';
import { MealDBRecipe, MealDBCategory, MealDBArea } from '../types/recipe';

export async function getRecipeOfTheDay(): Promise<MealDBRecipe | null> {
    try {
        const response = await fetch(`${MEALDB_BASE}/random.php`);
        if (!response.ok) throw new Error('Failed to fetch recipe of the day');
        const data = await response.json();
        return data.meals?.[0] || null;
    } catch (error) {
        console.error('Error fetching recipe of the day:', error);
        return null;
    }
}

export async function getCategories(): Promise<MealDBCategory[]> {
    try {
        const response = await fetch(`${MEALDB_BASE}/list.php?c=list`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getAreas(): Promise<MealDBArea[]> {
    try {
        const response = await fetch(`${MEALDB_BASE}/list.php?a=list`);
        if (!response.ok) throw new Error('Failed to fetch areas');
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
}

export async function getMealsByCategory(category: string): Promise<MealDBRecipe[]> {
    try {
        const response = await fetch(`${MEALDB_BASE}/filter.php?c=${category}`);
        if (!response.ok) throw new Error('Failed to fetch meals');
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching meals by category:', error);
        return [];
    }
}

export async function getMealsByArea(area: string): Promise<MealDBRecipe[]> {
    try {
        const response = await fetch(`${MEALDB_BASE}/filter.php?a=${area}`);
        if (!response.ok) throw new Error('Failed to fetch meals');
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching meals by area:', error);
        return [];
    }
}
