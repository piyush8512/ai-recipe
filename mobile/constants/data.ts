// ============================================
// AI Recipe Mobile — Static Data (from web)
// ============================================

export const CATEGORY_EMOJIS: Record<string, string> = {
    Beef: '🥩',
    Chicken: '🍗',
    Dessert: '🍰',
    Lamb: '🍖',
    Miscellaneous: '🍴',
    Pasta: '🍝',
    Pork: '🥓',
    Seafood: '🦐',
    Side: '🥗',
    Starter: '🥟',
    Vegan: '🥬',
    Vegetarian: '🥕',
    Breakfast: '🍳',
    Goat: '🐐',
};

export const COUNTRY_FLAGS: Record<string, string> = {
    American: '🗽',
    British: '👑',
    Canadian: '🍁',
    Chinese: '🐉',
    Croatian: '⚽',
    Dutch: '🌷',
    Egyptian: '🐫',
    Filipino: '🌴',
    French: '🥐',
    Greek: '🏛️',
    Indian: '🪷',
    Irish: '☘️',
    Italian: '🍕',
    Jamaican: '🌴',
    Japanese: '🗾',
    Kenyan: '🦒',
    Malaysian: '🌺',
    Mexican: '🌮',
    Moroccan: '🕌',
    Polish: '🦅',
    Portuguese: '🚢',
    Russian: '❄️',
    Spanish: '💃',
    Thai: '🛕',
    Tunisian: '🏜️',
    Turkish: '🧿',
    Ukrainian: '🌻',
    Vietnamese: '🍜',
};

export function getCategoryEmoji(category: string): string {
    return CATEGORY_EMOJIS[category] || '🍽️';
}

export function getCountryFlag(country: string): string {
    return COUNTRY_FLAGS[country] || '🌍';
}

export const ONBOARDING_SLIDES = [
    {
        id: '1',
        title: 'Your fridge →\na masterpiece',
        subtitle: 'Snap a photo of your ingredients and let AI create delicious recipes for you.',
        emoji: '📸',
    },
    {
        id: '2',
        title: 'AI-powered\nrecipes in seconds',
        subtitle: 'Gemini AI analyzes your pantry and suggests personalized meals instantly.',
        emoji: '🤖',
    },
    {
        id: '3',
        title: 'Save, share,\nnever waste food',
        subtitle: 'Build your digital cookbook. Export as PDF. Reduce food waste.',
        emoji: '📖',
    },
];
