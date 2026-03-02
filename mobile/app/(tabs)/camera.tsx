// ============================================
// AI Recipe Mobile — Camera / Scan Screen
// ============================================

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../../constants/theme";
import { usePantryStore } from "../../store/pantryStore";
import { useUserStore } from "../../store/userStore";
import { ScannedIngredient } from "../../types/pantry";

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    scannedIngredients,
    isScanning,
    scanImage,
    saveScanResults,
    clearScanResults,
  } = usePantryStore();
  const { user } = useUserStore();

  const pickImage = async (fromCamera: boolean) => {
    await Haptics.selectionAsync();
    let result;

    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Camera access is required to scan ingredients.",
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      if (asset.base64) {
        await scanImage(asset.base64, asset.mimeType || "image/jpeg");
      }
    }
  };

  const handleSaveAll = async () => {
    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in to save items to your pantry.",
      );
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveScanResults(user.id);
    Alert.alert("✅ Saved!", "All ingredients have been added to your pantry.");
    setSelectedImage(null);
  };

  const handleReset = () => {
    Haptics.selectionAsync();
    setSelectedImage(null);
    clearScanResults();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Your Pantry 📸</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo of your fridge or pantry — AI will identify your
            ingredients.
          </Text>
        </View>

        {/* Image Area */}
        {!selectedImage ? (
          <View style={styles.uploadArea}>
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="camera" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Snap or Upload</Text>
              <Text style={styles.uploadSubtitle}>
                Take a photo of your fridge or pick from gallery
              </Text>

              <View style={styles.uploadButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera"
                    size={20}
                    color={Colors.textInverse}
                  />
                  <Text style={styles.primaryButtonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => pickImage(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="images" size={20} color={Colors.primary} />
                  <Text style={styles.secondaryButtonText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
            <TouchableOpacity style={styles.retakeButton} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color={Colors.textInverse} />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scanning indicator */}
        {isScanning && (
          <View style={styles.scanningContainer}>
            <LottieView
              source={{
                uri: "https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json",
              }}
              autoPlay
              loop
              style={styles.scanLottie}
            />
            <Text style={styles.scanningText}>
              Gemini is analyzing your image...
            </Text>
          </View>
        )}

        {/* Scanned Results */}
        {scannedIngredients.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Found {scannedIngredients.length} Ingredients
              </Text>
              <View style={styles.confidenceBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.success}
                />
                <Text style={styles.confidenceText}>AI Verified</Text>
              </View>
            </View>

            {scannedIngredients.map(
              (item: ScannedIngredient, index: number) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientQuantity}>
                      {item.quantity}
                    </Text>
                  </View>
                  {item.confidence && (
                    <Text style={styles.ingredientConfidence}>
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  )}
                </View>
              ),
            )}

            <TouchableOpacity
              style={styles.saveAllButton}
              onPress={handleSaveAll}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add-circle"
                size={22}
                color={Colors.textInverse}
              />
              <Text style={styles.saveAllText}>Add All to Pantry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing["4xl"],
  },

  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: FontSizes["3xl"],
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: "300",
    lineHeight: 22,
  },

  // Upload area
  uploadArea: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  uploadIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  uploadTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  uploadSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    fontWeight: "300",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    ...Shadows.glow,
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.textInverse,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  secondaryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.primary,
  },

  // Preview
  previewContainer: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadows.md,
  },
  previewImage: {
    width: "100%",
    height: 260,
    borderRadius: Radius.lg,
  },
  retakeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  retakeText: {
    color: Colors.textInverse,
    fontWeight: "600",
    fontSize: FontSizes.sm,
  },

  // Scanning
  scanningContainer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.md,
  },
  scanLottie: {
    width: 120,
    height: 120,
  },
  scanningText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: "500",
  },

  // Results
  resultsContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.base,
    ...Shadows.md,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  resultsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  confidenceText: {
    fontSize: FontSizes.xs,
    fontWeight: "600",
    color: Colors.success,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.text,
  },
  ingredientQuantity: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ingredientConfidence: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.success,
  },
  saveAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.base,
    ...Shadows.glow,
  },
  saveAllText: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.textInverse,
  },
});
