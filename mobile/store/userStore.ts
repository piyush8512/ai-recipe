// ============================================
// AI Recipe Mobile — User Store (Zustand)
// ============================================

import { create } from 'zustand';
import { AppUser, SubscriptionTier } from '../types/user';

interface UserState {
    user: AppUser | null;
    isLoading: boolean;

    setUser: (user: AppUser) => void;
    clearUser: () => void;
    isPro: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isLoading: false,

    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
    isPro: () => get().user?.subscriptionTier === 'pro',
}));
