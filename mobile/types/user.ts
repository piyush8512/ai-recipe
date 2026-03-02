// ============================================
// AI Recipe Mobile — User Types
// ============================================

export type SubscriptionTier = 'free' | 'pro';

export interface AppUser {
    id: number;
    username: string;
    email: string;
    clerkId: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    subscriptionTier: SubscriptionTier;
}
