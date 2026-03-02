// ============================================
// AI Recipe Mobile — Entry Redirect
// ============================================

import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { CLERK_PUBLISHABLE_KEY } from "../constants/config";

function AuthIndexRedirect() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

export default function Index() {
  const hasClerk = Boolean(CLERK_PUBLISHABLE_KEY);

  if (!hasClerk) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthIndexRedirect />;
}
