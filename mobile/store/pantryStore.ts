// ============================================
// AI Recipe Mobile — Pantry Store (Zustand)
// ============================================

import { create } from 'zustand';
import { PantryItem, ScannedIngredient } from '../types/pantry';
import * as pantryService from '../services/pantry.service';

interface PantryState {
    items: PantryItem[];
    scannedIngredients: ScannedIngredient[];
    isLoading: boolean;
    isScanning: boolean;
    error: string | null;

    // Actions
    fetchItems: (userId: number) => Promise<void>;
    addItem: (userId: number, name: string, quantity: string) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    scanImage: (base64: string, mimeType: string) => Promise<void>;
    saveScanResults: (userId: number) => Promise<void>;
    clearScanResults: () => void;
    clearError: () => void;
}

export const usePantryStore = create<PantryState>((set, get) => ({
    items: [],
    scannedIngredients: [],
    isLoading: false,
    isScanning: false,
    error: null,

    fetchItems: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const items = await pantryService.getPantryItems(userId);
            set({ items, isLoading: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to load pantry', isLoading: false });
        }
    },

    addItem: async (userId, name, quantity) => {
        try {
            const item = await pantryService.addPantryItem(userId, name, quantity);
            set((state) => ({ items: [item, ...state.items] }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add item' });
        }
    },

    removeItem: async (itemId) => {
        try {
            await pantryService.deletePantryItem(itemId);
            set((state) => ({ items: state.items.filter((i) => i.documentId !== itemId) }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to remove item' });
        }
    },

    scanImage: async (base64, mimeType) => {
        set({ isScanning: true, error: null });
        try {
            const ingredients = await pantryService.scanPantryImage(base64, mimeType);
            set({ scannedIngredients: ingredients, isScanning: false });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Scan failed', isScanning: false });
        }
    },

    saveScanResults: async (userId) => {
        const { scannedIngredients } = get();
        set({ isLoading: true });
        try {
            const saved = await pantryService.saveBulkToPantry(userId, scannedIngredients);
            set((state) => ({
                items: [...saved, ...state.items],
                scannedIngredients: [],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Save failed', isLoading: false });
        }
    },

    clearScanResults: () => set({ scannedIngredients: [] }),
    clearError: () => set({ error: null }),
}));
