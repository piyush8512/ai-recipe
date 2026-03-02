// ============================================
// AI Recipe Mobile — Auth Service
// ============================================

import { api } from './api';
import { AppUser, SubscriptionTier } from '../types/user';

interface StrapiResponse<T> {
    data: T;
    meta?: unknown;
}

// Sync Clerk user with Strapi (mirrors web checkUser logic)
export async function syncUserToStrapi(
    clerkId: string,
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    imageUrl: string,
    subscriptionTier: SubscriptionTier
): Promise<AppUser | null> {
    try {
        // Check if user exists
        const response = await fetch(
            `${api['baseUrl']}/api/users?filters[clerkId][$eq]=${clerkId}`,
            {
                headers: {
                    Authorization: `Bearer ${api['token']}`,
                },
            }
        );

        if (!response.ok) return null;
        const existingUsers = await response.json();

        if (existingUsers.length > 0) {
            const user = existingUsers[0];

            // Update subscription if changed
            if (user.subscriptionTier !== subscriptionTier) {
                await fetch(`${api['baseUrl']}/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${api['token']}`,
                    },
                    body: JSON.stringify({ subscriptionTier }),
                });
            }

            return { ...user, subscriptionTier };
        }

        // Get authenticated role
        const rolesRes = await fetch(`${api['baseUrl']}/api/users-permissions/roles`, {
            headers: { Authorization: `Bearer ${api['token']}` },
        });
        const rolesData = await rolesRes.json();
        const authRole = rolesData.roles?.find((r: any) => r.type === 'authenticated');

        if (!authRole) return null;

        // Create new user
        const newUserRes = await fetch(`${api['baseUrl']}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${api['token']}`,
            },
            body: JSON.stringify({
                username: username || email.split('@')[0],
                email,
                password: `clerk_managed_${clerkId}_${Date.now()}`,
                confirmed: true,
                blocked: false,
                role: authRole.id,
                clerkId,
                firstName: firstName || '',
                lastName: lastName || '',
                imageUrl: imageUrl || '',
                subscriptionTier,
            }),
        });

        if (!newUserRes.ok) return null;
        return await newUserRes.json();
    } catch (error) {
        console.error('Error syncing user to Strapi:', error);
        return null;
    }
}
