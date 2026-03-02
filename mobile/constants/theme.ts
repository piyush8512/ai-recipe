// ============================================
// AI Recipe Mobile — Design System Tokens
// ============================================

export const Colors = {
    primary: '#E85D04',
    primaryDark: '#C44D03',
    primaryLight: '#FFF3E8',
    accent: '#F4A261',
    success: '#2D6A4F',
    successLight: '#D4EDDA',
    error: '#DC3545',
    errorLight: '#FDE8EA',
    warning: '#F59E0B',

    // Neutrals
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F3',
    border: '#E7E5E0',
    borderDark: '#1C1917',

    // Text
    text: '#1C1917',
    textSecondary: '#78716C',
    textMuted: '#A8A29E',
    textInverse: '#FFFFFF',

    // Dark mode
    darkBg: '#1C1917',
    darkSurface: '#292524',
    darkBorder: '#44403C',
};

export const Fonts = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

export const FontSizes = {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 40,
    display: 48,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 999,
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 5,
    },
    glow: {
        shadowColor: '#E85D04',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 8,
    },
};
