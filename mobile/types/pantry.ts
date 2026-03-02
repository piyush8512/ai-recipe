// ============================================
// AI Recipe Mobile — Pantry Types
// ============================================

export interface PantryItem {
    id?: number;
    documentId: string;
    name: string;
    quantity: string;
    imageUrl?: string;
    createdAt: string;
}

export interface ScannedIngredient {
    name: string;
    quantity: string;
    confidence?: number;
}
