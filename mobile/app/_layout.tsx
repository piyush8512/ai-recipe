// ============================================
// AI Recipe Mobile — Root Layout
// ============================================

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { CLERK_PUBLISHABLE_KEY } from "../constants/config";
import { tokenCache } from "../services/token-cache";
import { useUserStore } from "../store/userStore";
import { syncUserToStrapi } from "../services/auth.service";
import { SubscriptionTier } from "../types/user";

function AppStack() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
         <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
       
        <Stack.Screen
          name="meals/[mode]/[value]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </>
  );
}

function UserSync() {
  const { isLoaded, isSignedIn, has } = useAuth();
  const { user } = useUser();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        if (useUserStore.getState().user !== null) {
          clearUser();
        }
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const tier: SubscriptionTier = has?.({ plan: "pro" }) ? "pro" : "free";
      const syncedUser = await syncUserToStrapi(
        user.id,
        email,
        user.username || email.split("@")[0],
        user.firstName || "",
        user.lastName || "",
        user.imageUrl || "",
        tier,
      );

      if (isMounted && syncedUser) {
        const currentUser = useUserStore.getState().user;
        if (
          !currentUser ||
          currentUser.clerkId !== syncedUser.clerkId ||
          currentUser.subscriptionTier !== syncedUser.subscriptionTier ||
          currentUser.email !== syncedUser.email ||
          currentUser.imageUrl !== syncedUser.imageUrl ||
          currentUser.username !== syncedUser.username ||
          currentUser.firstName !== syncedUser.firstName ||
          currentUser.lastName !== syncedUser.lastName
        ) {
          setUser(syncedUser);
        }
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user?.id, user?.updatedAt, setUser, clearUser]);

  return null;
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;

    const firstSegment = segments[0];
    const isOnboardingRoute = firstSegment === "onboarding";
    const isAuthRoute = firstSegment === "(auth)";

    const isRootIndexRoute = firstSegment === "index";

    if (!isSignedIn && !isAuthRoute) {
      router.replace("/onboarding");
      return;
    }

    if (isSignedIn && (isAuthRoute || isOnboardingRoute || isRootIndexRoute)) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return null;
}

export default function RootLayout() {
  const hasClerk = Boolean(CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="dark" backgroundColor={Colors.primary} />
        <View style={styles.missingConfigContainer}>
          <Text style={styles.missingConfigTitle}>Authentication required</Text>
          <Text style={styles.missingConfigText}>
            Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to enable sign-in.
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AuthGate />
        <UserSync />
        <AppStack />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  missingConfigContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
    gap: 8,
  },
  missingConfigTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  missingConfigText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
