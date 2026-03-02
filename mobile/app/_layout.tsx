// ============================================
// AI Recipe Mobile — Root Layout
// ============================================

import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
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
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      if (!isLoaded) return;

      if (!isSignedIn || !user) {
        clearUser();
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
        setUser(syncedUser);
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [
    isLoaded,
    isSignedIn,
    user?.id,
    user?.updatedAt,
    has,
    setUser,
    clearUser,
  ]);

  return null;
}

export default function RootLayout() {
  const hasClerk = Boolean(CLERK_PUBLISHABLE_KEY);

  return (
    <GestureHandlerRootView style={styles.container}>
      {!hasClerk ? (
        <AppStack />
      ) : (
        <ClerkProvider
          publishableKey={CLERK_PUBLISHABLE_KEY}
          tokenCache={tokenCache}
        >
          <UserSync />
          <AppStack />
        </ClerkProvider>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
