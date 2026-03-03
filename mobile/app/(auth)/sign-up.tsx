import { useOAuth, useSignUp } from "@clerk/clerk-expo";
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
import * as WebBrowser from "expo-web-browser";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors, FontSizes, Radius, Spacing } from "../../constants/theme";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const trimmedName = name.trim();
      const [firstName = "", ...rest] = trimmedName
        ? trimmedName.split(" ")
        : [];
      const lastName = rest.join(" ");

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
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

  const handleGoogleAuth = async () => {
    if (!isLoaded) return;
    setError("");
    setGoogleLoading(true);

    try {
      const {
        createdSessionId,
        setActive: oauthSetActive,
        signIn,
        signUp,
      } = await startOAuthFlow();

      if (createdSessionId) {
        await (oauthSetActive ?? setActive)({ session: createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      if (signIn?.status === "complete" && signIn.createdSessionId) {
        await (oauthSetActive ?? setActive)({
          session: signIn.createdSessionId,
        });
        router.replace("/(tabs)");
        return;
      }

      if (signUp?.status === "complete" && signUp.createdSessionId) {
        await (oauthSetActive ?? setActive)({
          session: signUp.createdSessionId,
        });
        router.replace("/(tabs)");
        return;
      }

      setError("Google sign-up was cancelled or could not be completed.");
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ||
          "Google sign-up failed. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
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
              placeholder="Name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

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

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButtonDisabled} disabled>
                <FontAwesome name="apple" size={20} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleAuth}
                activeOpacity={0.85}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <FontAwesome name="google" size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButtonDisabled} disabled>
                <FontAwesome
                  name="facebook"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.socialHint}>
              Google is enabled. Apple/Facebook coming soon.
            </Text>
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
  dividerRow: {
    marginTop: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.base,
  },
  socialButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonDisabled: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  socialHint: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
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
