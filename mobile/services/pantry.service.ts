// ============================================
// AI Recipe Mobile — Pantry Service
// ============================================

import { api } from './api';
import { PantryItem, ScannedIngredient } from '../types/pantry';
import { GEMINI_API_KEY } from '../constants/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface StrapiResponse<T> {
    data: T;
    meta?: unknown;
}

// ─── Fetch pantry items ────────────────
export async function getPantryItems(userId: number): Promise<PantryItem[]> {
    const result = await api.get<StrapiResponse<PantryItem[]>>(
        `/api/pantry-items?filters[owner][id][$eq]=${userId}&sort=createdAt:desc`
    );
    return result.data || [];
}

// ─── Add a pantry item manually ────────
export async function addPantryItem(
    userId: number,
    name: string,
    quantity: string
): Promise<PantryItem> {
    const result = await api.post<StrapiResponse<PantryItem>>('/api/pantry-items', {
        data: {
            name: name.trim(),
            quantity: quantity.trim(),
            imageUrl: '',
            owner: userId,
        },
    });
    return result.data;
}

// ─── Delete a pantry item ──────────────
export async function deletePantryItem(itemId: string): Promise<void> {
    await api.delete(`/api/pantry-items/${itemId}`);
}

// ─── Update a pantry item ──────────────
export async function updatePantryItem(
    itemId: string,
    name: string,
    quantity: string
): Promise<PantryItem> {
    const result = await api.put<StrapiResponse<PantryItem>>(
        `/api/pantry-items/${itemId}`,
        { data: { name, quantity } }
    );
    return result.data;
}

// ─── Save multiple scanned items ───────
export async function saveBulkToPantry(
    userId: number,
    ingredients: ScannedIngredient[]
): Promise<PantryItem[]> {
    const saved: PantryItem[] = [];
    for (const ingredient of ingredients) {
        try {
            const item = await addPantryItem(userId, ingredient.name, ingredient.quantity);
            saved.push(item);
        } catch (error) {
            console.error(`Failed to save ${ingredient.name}:`, error);
        }
    }
    return saved;
}

// ─── Scan image with Gemini Vision ─────
export async function scanPantryImage(
    base64Image: string,
    mimeType: string
): Promise<ScannedIngredient[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
[
  {
    "name": "ingredient name",
    "quantity": "estimated quantity with unit",
    "confidence": 0.95
  }
]

Rules:
- Only identify food ingredients (not containers, utensils, or packaging)
- Be specific (e.g., "Cheddar Cheese" not just "Cheese")
- Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
- Confidence should be 0.7-1.0 (omit items below 0.7)
- Maximum 20 items
`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ]);

    const response = await result.response;
    const text = response.text();

    const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

    const ingredients: ScannedIngredient[] = JSON.parse(cleanText);

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new Error('No ingredients detected. Please try a clearer photo.');
    }

    return ingredients.slice(0, 20);
}
