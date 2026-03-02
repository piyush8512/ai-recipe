import { useSignIn } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, FontSizes, Radius, Spacing } from "../../constants/theme";

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Additional authentication steps are required.");
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage || "Sign-in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>
          Sign in to sync your pantry and recipes.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          New here?{" "}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create account
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes["3xl"],
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: FontSizes.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  error: {
    color: Colors.error,
    fontSize: FontSizes.sm,
  },
  button: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  buttonText: {
    color: Colors.textInverse,
    fontWeight: "700",
    fontSize: FontSizes.md,
  },
  footerText: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  link: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
