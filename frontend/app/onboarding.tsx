import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  StyleSheet,
  type ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeName, themeNames } from '../theme';
import { themeTokens } from '../theme/tokens';
import { m3Typography, m3Spacing, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';

const ONBOARDING_KEY = 'polymath-onboarding-complete';
const { width: SCREEN_W } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'welcome',
    icon: 'psychology',
    title: 'Welcome to Polymath OS',
    description: 'Your personal knowledge operating system. Track what you learn, discover connections, and grow your expertise across every domain.',
  },
  {
    id: 'features',
    icon: 'auto-awesome',
    title: 'Smart Knowledge Graph',
    description: 'Every article, video, and note you capture gets analyzed by AI. Discover hidden connections between your interests through the neural mesh.',
  },
  {
    id: 'journal',
    icon: 'edit-note',
    title: 'Reflect & Journal',
    description: 'Capture your thoughts with rich journaling. Tag entries, link them to your activities, and build a timeline of your intellectual journey.',
  },
  {
    id: 'agent',
    icon: 'smart-toy',
    title: 'Your AI Agent',
    description: 'Chat with an AI that knows your learning history. Get personalized suggestions, summaries, and insights tailored to your knowledge graph.',
  },
];

export default function OnboardingScreen() {
  const { theme, setTheme, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const setThemeName = useStore((s) => s.setThemeName);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const bg = theme.surface;
  const textColor = theme.onSurface;
  const textMuted = theme.onSurfaceVariant;
  const primary = theme.primary;
  const onPrimary = theme.onPrimary;
  const cardBg = theme.surfaceContainerHigh;
  const border = theme.outlineVariant;

  const isLast = currentIndex === SLIDES.length - 1;

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleThemeSelect = (name: ThemeName) => {
    setTheme(name);
    setThemeName(name);
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <View style={[styles.iconCircle, { backgroundColor: primary }]}>
        <MaterialIcons name={item.icon} size={48} color={onPrimary} />
      </View>
      <Text style={[styles.slideTitle, { color: textColor }]}>{item.title}</Text>
      <Text style={[styles.slideDesc, { color: textMuted }]}>{item.description}</Text>

      {/* Theme picker on first slide */}
      {item.id === 'welcome' && (
        <View style={styles.themeSection}>
          <Text style={[styles.themeLabel, { color: textMuted }]}>CHOOSE YOUR THEME</Text>
          <View style={styles.themeRow}>
            {themeNames.map((name) => {
              const t = themeTokens[name];
              const isActive = themeName === name;
              return (
                <Pressable
                  key={name}
                  onPress={() => handleThemeSelect(name)}
                  style={({ pressed }) => [
                    styles.themeSwatch,
                    {
                      backgroundColor: t.surface,
                      borderColor: isActive ? t.primary : border,
                      borderWidth: isActive ? 2 : 1,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={[styles.swatchDot, { backgroundColor: t.primary }]} />
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      <View style={styles.topRow}>
        <Pressable onPress={handleSkip} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={[styles.skipText, { color: textMuted }]}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        style={styles.flatList}
      />

      {/* Dots + Next button */}
      <View style={styles.bottomSection}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? primary : border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.nextText, { color: onPrimary }]}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
          {!isLast && <MaterialIcons name="arrow-forward" size={20} color={onPrimary} />}
        </Pressable>
      </View>
    </View>
  );
}

/** Check if onboarding has been completed */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: m3Spacing.lg,
    paddingTop: m3Spacing.sm,
  },
  skipText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '500',
  },
  flatList: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: m3Spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: m3Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: m3Spacing.xl,
  },
  slideTitle: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
    lineHeight: m3Typography.headlineMedium.lineHeight,
    textAlign: 'center',
    marginBottom: m3Spacing.md,
  },
  slideDesc: {
    fontSize: m3Typography.bodyLarge.fontSize,
    lineHeight: m3Typography.bodyLarge.lineHeight,
    textAlign: 'center',
    maxWidth: 320,
  },
  themeSection: {
    marginTop: m3Spacing.xl,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: m3Spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: m3Spacing.sm,
  },
  themeSwatch: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: {
    width: 16,
    height: 16,
    borderRadius: m3Radii.full,
  },
  bottomSection: {
    paddingHorizontal: m3Spacing.lg,
    paddingBottom: m3Spacing.lg,
    gap: m3Spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: m3Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: m3Radii.full,
  },
  nextBtn: {
    height: m3TouchTarget.comfortable,
    borderRadius: m3Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: m3Spacing.sm,
  },
  nextText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
});
