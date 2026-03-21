import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Typography } from '../../../shared/design-tokens';

type EmptyVariant =
  | 'empty-activities'
  | 'empty-journals'
  | 'empty-connections'
  | 'empty-search'
  | 'empty-alerts'
  | 'empty-memories';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCTA?: () => void;
  icon?: string;
}

const VARIANT_DEFAULTS: Record<EmptyVariant, { icon: string; title: string; description: string; cta: string }> = {
  'empty-activities': {
    icon: 'layers-outline',
    title: 'No activities yet',
    description: 'Start capturing your thoughts, links, and discoveries to build your knowledge base.',
    cta: 'Add Activity',
  },
  'empty-journals': {
    icon: 'book-outline',
    title: 'Your journal is empty',
    description: 'Begin writing journal entries to reflect on your experiences and ideas.',
    cta: 'New Entry',
  },
  'empty-connections': {
    icon: 'git-network-outline',
    title: 'No connections found',
    description: 'As you add more activities, connections between ideas will emerge automatically.',
    cta: 'Explore Knowledge',
  },
  'empty-search': {
    icon: 'search-outline',
    title: 'No results found',
    description: 'Try adjusting your search terms or exploring different categories.',
    cta: 'Clear Search',
  },
  'empty-alerts': {
    icon: 'notifications-outline',
    title: 'All caught up',
    description: "You don't have any notifications right now. Check back later!",
    cta: '',
  },
  'empty-memories': {
    icon: 'sparkles-outline',
    title: 'No memories yet',
    description: 'Your AI agent will create memories as it learns from your interactions.',
    cta: 'Talk to Agent',
  },
};

export function EmptyState({
  variant = 'empty-activities',
  title,
  description,
  ctaLabel,
  onCTA,
  icon,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const floatY = useSharedValue(0);
  const defaults = VARIANT_DEFAULTS[variant];

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayCTA = ctaLabel || defaults.cta;
  const displayIcon = icon || defaults.icon;

  return (
    <View style={styles.container}>
      {/* Floating illustration */}
      <Animated.View style={floatStyle}>
        <View
          style={[
            styles.illustrationCircle,
            { backgroundColor: theme.primaryContainer },
          ]}
        >
          <Ionicons
            name={displayIcon as any}
            size={48}
            color={theme.onPrimaryContainer}
          />
        </View>
      </Animated.View>

      {/* Decorative dots */}
      <View style={styles.dotsRow}>
        <View style={[styles.decorDot, { backgroundColor: theme.primary, opacity: 0.3 }]} />
        <View style={[styles.decorDot, styles.dotLg, { backgroundColor: theme.primaryContainer, opacity: 0.5 }]} />
        <View style={[styles.decorDot, { backgroundColor: theme.primary, opacity: 0.2 }]} />
      </View>

      {/* Text */}
      <Text style={[styles.title, { color: theme.onSurface }]}>{displayTitle}</Text>
      <Text style={[styles.description, { color: theme.onSurfaceVariant }]}>{displayDesc}</Text>

      {/* CTA */}
      {displayCTA.length > 0 && onCTA && (
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: theme.primary }]}
          onPress={onCTA}
          activeOpacity={0.7}
        >
          <Text style={[styles.ctaLabel, { color: theme.onPrimary }]}>{displayCTA}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  illustrationCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  decorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLg: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: m3Typography.bodyMedium.fontSize,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  ctaLabel: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
});
