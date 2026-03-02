import { useSignUp } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage || "Sign-up failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Verification is incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Create your account ✨</Text>
        <Text style={styles.subtitle}>
          Start scanning ingredients and cooking smarter.
        </Text>

        {!pendingVerification ? (
          <>
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
              onPress={handleCreateAccount}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.verifyText}>
              Enter the 6-digit code sent to your email.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Verification code"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyCode}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
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
  verifyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
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
