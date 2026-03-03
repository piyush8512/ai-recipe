
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  Colors,
  FontSizes,
  Spacing,
  Radius,
  Shadows,
} from "../constants/theme";
import { ONBOARDING_SLIDES } from "../constants/data";

const { width, height } = Dimensions.get("window");
const DISH_CARD_WIDTH = 96;
const DISH_CARD_GAP = 12;
const DISH_ITEMS = [
  {
    id: "dish-1",
    imageUri:
      "https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg",
  },
  {
    id: "dish-2",
    imageUri:
      "https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg",
  },
  {
    id: "dish-3",
    imageUri:
      "https://www.themealdb.com/images/media/meals/58oia61564916529.jpg",
  },
  {
    id: "dish-4",
    imageUri: "https://www.themealdb.com/images/media/meals/1529446137.jpg",
  },
  {
    id: "dish-5",
    imageUri:
      "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  },
  {
    id: "dish-6",
    imageUri:
      "https://www.themealdb.com/images/media/meals/usywpp1511189717.jpg",
  },
];

type FeatureSlide = (typeof ONBOARDING_SLIDES)[0];
type OnboardingItem =
  | { id: "welcome"; type: "welcome" }
  | ({ type: "feature" } & FeatureSlide);

function FeaturePhoneMock({ featureId }: { featureId: string }) {
  // Retained your original mock UI components but adapted the shell style
  // to perfectly match the sleek empty look of the screenshot when no content is present.
  return (
    <View style={styles.phoneShellWrap}>
      <View style={styles.phoneShell}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          {featureId === "1" && (
            <>
              <View style={styles.mockHeaderRow}>
                <Text style={styles.mockHeaderTitle}>Scan Pantry</Text>
                <Text style={styles.mockHeaderAction}>AI</Text>
              </View>
              <Image
                source={{ uri: DISH_ITEMS[0].imageUri }}
                style={styles.mockMainImage}
              />
              <View style={styles.mockChipRow}>
                <View style={styles.mockChip}>
                  <Text style={styles.mockChipText}>Tomato</Text>
                </View>
                <View style={styles.mockChip}>
                  <Text style={styles.mockChipText}>Onion</Text>
                </View>
                <View style={styles.mockChip}>
                  <Text style={styles.mockChipText}>Pasta</Text>
                </View>
              </View>
              <View style={styles.mockPrimaryAction}>
                <Text style={styles.mockPrimaryActionText}>
                  Generate Recipes
                </Text>
              </View>
            </>
          )}

          {featureId === "2" && (
            <>
              <View style={styles.mockHeaderRow}>
                <Text style={styles.mockHeaderTitle}>Recipe Picks</Text>
                <Text style={styles.mockHeaderAction}>3 New</Text>
              </View>

              {[DISH_ITEMS[1], DISH_ITEMS[2], DISH_ITEMS[3]].map((dish) => (
                <View key={dish.id} style={styles.mockListCard}>
                  <Image
                    source={{ uri: dish.imageUri }}
                    style={styles.mockListImage}
                  />
                  <View style={styles.mockListMeta}>
                    <Text style={styles.mockListTitle}>AI Suggested Meal</Text>
                    <Text style={styles.mockListSub}>25 min · Easy</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {featureId === "3" && (
            <>
              <View style={styles.mockHeaderRow}>
                <Text style={styles.mockHeaderTitle}>Saved Recipes</Text>
                <Text style={styles.mockHeaderAction}>Pro</Text>
              </View>
              <Image
                source={{ uri: DISH_ITEMS[4].imageUri }}
                style={styles.mockSavedHero}
              />
              <Text style={styles.mockSavedTitle}>Creamy Garlic Pasta</Text>
              <Text style={styles.mockSavedSub}>Saved for dinner tonight</Text>
              <View style={styles.mockActionRow}>
                <View style={styles.mockSecondaryAction}>
                  <Text style={styles.mockSecondaryText}>Share</Text>
                </View>
                <View style={styles.mockPrimaryActionCompact}>
                  <Text style={styles.mockPrimaryActionText}>Cook Now</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function DishSliderRow({
  items,
  animatedValue,
  reverse = false,
  rotationDeg = "0deg",
}: {
  items: { id: string; imageUri: string }[];
  animatedValue: Animated.Value;
  reverse?: boolean;
  rotationDeg?: string;
}) {
  const duplicatedItems = useMemo(() => [...items, ...items], [items]);
  const singleTrackWidth = useMemo(
    () => items.length * (DISH_CARD_WIDTH + DISH_CARD_GAP),
    [items.length],
  );

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-singleTrackWidth, 0] : [0, -singleTrackWidth],
  });

  return (
    <View
      style={[styles.dishRowViewport, { transform: [{ rotate: rotationDeg }] }]}
    >
      <Animated.View
        style={[
          styles.dishRowTrack,
          {
            width: singleTrackWidth * 2,
            transform: [{ translateX }],
          },
        ]}
      >
        {duplicatedItems.map((dish, index) => (
          <View key={`${dish.id}-${index}`} style={styles.dishCard}>
            <Image source={{ uri: dish.imageUri }} style={styles.dishImage} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function WelcomeSlide({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void;
  onSignIn: () => void;
}) {
  const row1 = useRef(new Animated.Value(0)).current;
  const row2 = useRef(new Animated.Value(0)).current;
  const row3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true },
      );

    row1.setValue(0);
    row2.setValue(0);
    row3.setValue(0);

    const loop1 = createLoop(row1, 12000);
    const loop2 = createLoop(row2, 14000);
    const loop3 = createLoop(row3, 13000);

    loop1.start();
    loop2.start();
    loop3.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [row1, row2, row3]);

  return (
    <View style={styles.welcomeSlide}>
      <View style={styles.welcomeTopArea}>
        <DishSliderRow
          items={DISH_ITEMS}
          animatedValue={row1}
          rotationDeg="-2deg"
        />
        <DishSliderRow
          items={DISH_ITEMS}
          animatedValue={row2}
          reverse
          rotationDeg="-2deg"
        />
        <DishSliderRow
          items={DISH_ITEMS}
          animatedValue={row3}
          rotationDeg="-2deg"
        />
      </View>

      <View style={styles.welcomeBottomArea}>
        <Text style={styles.welcomeTitle}>
          Your Recipe Haven Awaits Exploration!
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Discover delicious meal ideas, smart pantry suggestions, and cook with
          confidence every day.
        </Text>

        <TouchableOpacity
          style={styles.welcomeButton}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.welcomeButtonText}>Let&apos;s Get Started</Text>
        </TouchableOpacity>

        <View style={styles.signInRow}>
          <Text style={styles.signInPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={onSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const onboardingItems = useMemo<OnboardingItem[]>(
    () => [
      { id: "welcome", type: "welcome" },
      ...ONBOARDING_SLIDES.map((slide) => ({
        ...slide,
        type: "feature" as const,
      })),
    ],
    [],
  );

  const featureIndex = Math.max(0, currentIndex - 1);
  const isWelcomeSlide = currentIndex === 0;

  const handleNext = () => {
    if (currentIndex < onboardingItems.length - 1) {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(auth)/sign-in");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 1) {
      Haptics.selectionAsync();
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace("/(auth)/sign-in");
  };

  const handleGetStartedFromWelcome = () => {
    Haptics.selectionAsync();
    flatListRef.current?.scrollToIndex({ index: 1 });
    setCurrentIndex(1);
  };

  // Helper to accurately style the title visually like the image if it matches the text
  const renderStyledTitle = (title: string) => {
    if (title.includes(":")) {
      const [lead, ...restParts] = title.split(":");
      const trailing = restParts.join(":").trim();

      return (
        <Text style={styles.featureTitle}>
          <Text style={styles.featureTitleStrong}>{lead}:</Text>
          <Text style={styles.featureTitleMuted}> {trailing}</Text>
        </Text>
      );
    }

    if (title === "Explore a World of Culinary Delights.") {
      return (
        <Text style={styles.featureTitle}>
          <Text style={styles.featureTitleStrong}>Explore a </Text>
          <Text style={styles.featureTitleMuted}>
            World of{"\n"}Culinary{" "}
          </Text>
          <Text style={styles.featureTitleStrong}>Delights.</Text>
        </Text>
      );
    }
    return <Text style={styles.featureTitle}>{title}</Text>;
  };

  const renderSlide = ({ item }: { item: OnboardingItem }) => {
    if (item.type === "welcome") {
      return (
        <WelcomeSlide
          onGetStarted={handleGetStartedFromWelcome}
          onSignIn={handleSkip}
        />
      );
    }

    const itemFeatureIndex = ONBOARDING_SLIDES.findIndex(
      (slide) => slide.id === item.id,
    );

    return (
      <View style={styles.featureSlide}>
        {/* Curved Top Area Clipping The Phone */}
        <View style={styles.featureTopWrapper}>
          <View style={styles.featureTopInner}>
            <FeaturePhoneMock featureId={item.id} />
          </View>
        </View>

        {/* Bottom Text and Controls Area */}
        <View style={styles.featureContentArea}>
          {/* Typographic Title Styling */}
          {renderStyledTitle(item.title)}

          {/* Subtitle mapping the specific Lorem text in the screenshot */}
          <Text style={styles.featureSubtitle}>{item.subtitle}</Text>

          {/* Centered Dots with Absolute Right Arrow */}
          <View style={styles.featureControlsRow}>
            <TouchableOpacity
              style={styles.featureArrowLeftButton}
              onPress={handlePrev}
              activeOpacity={0.85}
              disabled={currentIndex <= 1}
            >
              <Text style={styles.featureArrowText}>←</Text>
            </TouchableOpacity>
            <View style={styles.featureDotsContainer}>
              {ONBOARDING_SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.featureDot,
                    itemFeatureIndex === i && styles.featureDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.featureArrowButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.featureArrowText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip button in Top Right Corner */}
      {!isWelcomeSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingItems}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  welcomeSlide: {
    width,
    flex: 1,
    paddingTop: Spacing["4xl"],
    backgroundColor: Colors.background,
  },
  welcomeTopArea: {
    height: height * 0.54,
    justifyContent: "center",
    gap: Spacing.md,
  },
  dishRowViewport: {
    overflow: "hidden",
    paddingVertical: Spacing.xs,
  },
  dishRowTrack: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
  },
  dishCard: {
    width: DISH_CARD_WIDTH,
    height: DISH_CARD_WIDTH,
    marginRight: DISH_CARD_GAP,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  dishImage: {
    width: "100%",
    height: "100%",
  },
  welcomeBottomArea: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
    paddingHorizontal: Spacing["xl"],
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: FontSizes["3xl"],
    color: Colors.text,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  welcomeButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  welcomeButtonText: {
    color: Colors.textInverse,
    fontSize: FontSizes.lg,
    fontWeight: "700",
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  signInPrompt: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    textDecorationLine: "underline",
    fontWeight: "700",
  },

  // ===================================
  // FEATURE SLIDE RE-STYLED TO MATCH
  // ===================================

  featureSlide: {
    width,
    flex: 1,
    backgroundColor: Colors.background,
  },
  featureTopWrapper: {
    width: width,
    height: height * 0.68, // Adjusting height to clip phone exactly where desired
    backgroundColor: "#F3F3F3",
        borderBottomLeftRadius: width* 0.2,
    borderBottomRightRadius: width* 0.2, // Large radius to create the sweeping curve
    overflow: "hidden", // This naturally hides the square corner of the top section and creates the concave curve
  },
  featureTopInner: {
    position: "absolute",

    bottom: -50,
    left: -(width * 0.25), // Extending 1.5x width so curve is gentle, pulling left to center
    width: width * 1.5,
    height: height,
    backgroundColor: "#F3F3F3", // Matches light grey from screenshot
    borderBottomLeftRadius: width , // Large radius to create the sweeping curve
    borderBottomRightRadius: 0,
        borderTopLeftRadius: width,
    borderTopRightRadius: width,
    alignItems: "center",
    justifyContent: "flex-end", // Push phone to bottom to slice it
// Control how deep the phone sits in the cut
  },
  featureContentArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",

 // Pull up to overlap the curve and create a seamless transition
    paddingTop: Spacing["2xl"],
    paddingHorizontal: Spacing["xl"],
    alignItems: "center",
  },
  featureTitle: {
    fontSize: FontSizes["2xl"],
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 36,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  featureTitleStrong: {
    color: Colors.text,
    fontWeight: "800",
  },
  featureTitleMuted: {
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  featureSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 310,
  },
  featureControlsRow: {
    width: "100%",
    marginTop: "auto", // Automatically pushes row to the bottom edge of content area
    marginBottom: Spacing["4xl"],
    flexDirection: "row",
    justifyContent: "center", // This perfectly centers the dots
    alignItems: "center",
    position: "relative", // Ensures absolute arrow respects boundaries
  },
  featureDotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  featureDotActive: {
    backgroundColor: Colors.textSecondary,
  },
  featureArrowButton: {
    position: "absolute",
    right: 0, // Forces button to far right while dots stay center
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  featureArrowLeftButton: {
    position: "absolute",
    left: 0,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  featureArrowText: {
    color: Colors.textInverse,
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },

  // SKIP BUTTON
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

  // PHONE MOCK
  phoneShellWrap: {
    width: width * 0.78, // Slightly wider to match visual ratio
    height: height * 0.68,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 60, // Pull up to hide the bottom curve and match the screenshot perfectly
  },
  phoneShell: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#1A1A1A", // Dark border matching mockup
    backgroundColor: "#1A1A1A",
    padding: 5,
  },
  phoneNotch: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    width: 80,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: "#1A1A1A",
    zIndex: 5,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 34, // Matches internal corner radius nicely
    backgroundColor: "#ffffff", // Matched empty gray from mockup image
    paddingTop: 45,
    paddingHorizontal: Spacing.base,
    overflow: "hidden",
  },

  // MOCK INNER UI (Kept from your logic)
  mockHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  mockHeaderTitle: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  mockHeaderAction: {
    fontSize: FontSizes.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  mockMainImage: {
    width: "100%",
    height: 120,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  mockChipRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: "wrap",
  },
  mockChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  mockChipText: {
    fontSize: FontSizes.xs,
    color: Colors.primaryDark,
    fontWeight: "600",
  },
  mockPrimaryAction: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    paddingVertical: 8,
  },
  mockPrimaryActionCompact: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: Spacing.base,
    flex: 1,
  },
  mockPrimaryActionText: {
    color: Colors.textInverse,
    fontSize: FontSizes.xs,
    fontWeight: "700",
  },
  mockListCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: 6,
    gap: Spacing.sm,
  },
  mockListImage: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
  },
  mockListMeta: {
    flex: 1,
  },
  mockListTitle: {
    fontSize: FontSizes.xs,
    color: Colors.text,
    fontWeight: "700",
  },
  mockListSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mockSavedHero: {
    width: "100%",
    height: 124,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  mockSavedTitle: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: "700",
  },
  mockSavedSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  mockActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  mockSecondaryAction: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: Spacing.base,
    flex: 1,
  },
  mockSecondaryText: {
    fontSize: FontSizes.xs,
    color: Colors.text,
    fontWeight: "600",
  },
});
