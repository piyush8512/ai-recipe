// ============================================
// AI Recipe Mobile — Onboarding Screen
// ============================================

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../constants/theme";
import { ONBOARDING_SLIDES } from "../constants/data";
import { CLERK_PUBLISHABLE_KEY } from "../constants/config";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(CLERK_PUBLISHABLE_KEY ? "/(auth)/sign-in" : "/(tabs)");
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace(CLERK_PUBLISHABLE_KEY ? "/(auth)/sign-in" : "/(tabs)");
  };

  const renderSlide = ({ item }: { item: (typeof ONBOARDING_SLIDES)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <LottieView
          source={{
            uri: "https://assets5.lottiefiles.com/packages/lf20_oqfm2f5l.json",
          }}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, currentIndex === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === ONBOARDING_SLIDES.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: "600",
  },

  // Slide
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: height * 0.15,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    ...Shadows.glow,
    overflow: "hidden",
  },
  lottie: {
    width: 140,
    height: 140,
  },
  emoji: {
    fontSize: 34,
    marginBottom: Spacing.base,
  },
  slideTitle: {
    fontSize: FontSizes["4xl"],
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 48,
    marginBottom: Spacing.base,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "300",
    maxWidth: 300,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: Radius.md,
    alignItems: "center",
    ...Shadows.glow,
  },
  nextButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    color: Colors.textInverse,
  },
});
