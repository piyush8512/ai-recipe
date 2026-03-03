// ============================================
// AI Recipe Mobile — Entry Redirect
// ============================================

import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

function AuthIndexRedirect() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

export default function Index() {
  return <AuthIndexRedirect />;
}
