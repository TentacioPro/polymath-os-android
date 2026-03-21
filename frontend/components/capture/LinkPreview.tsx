import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking } from 'react-native';
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

interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  domain?: string;
}

interface LinkPreviewProps {
  url: string;
  metadata?: LinkMetadata | null;
  loading?: boolean;
  error?: boolean;
  onEditTitle?: (title: string) => void;
  onRemove?: () => void;
}

function SkeletonBar({ width, height, color }: { width: number | string; height: number; color: string }) {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.4,
  }));
  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: height / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function LinkPreview({
  url,
  metadata,
  loading = false,
  error = false,
  onEditTitle,
  onRemove,
}: LinkPreviewProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
        <SkeletonBar width="100%" height={140} color={theme.surfaceContainerHigh} />
        <View style={styles.content}>
          <View style={styles.domainRow}>
            <SkeletonBar width={24} height={24} color={theme.surfaceContainerHigh} />
            <SkeletonBar width={100} height={14} color={theme.surfaceContainerHigh} />
          </View>
          <SkeletonBar width="85%" height={18} color={theme.surfaceContainerHigh} />
          <SkeletonBar width="65%" height={14} color={theme.surfaceContainerHigh} />
        </View>
      </View>
    );
  }

  if (error || !metadata) {
    return (
      <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
        <View style={[styles.errorContent, { gap: 12 }]}>
          <View style={[styles.errorIcon, { backgroundColor: theme.errorContainer }]}>
            <Ionicons name="link-outline" size={28} color={theme.error} />
          </View>
          <Text style={[styles.errorText, { color: theme.onSurfaceVariant }]}>
            Could not fetch preview
          </Text>
          <Text
            style={[styles.urlText, { color: theme.primary }]}
            numberOfLines={1}
            onPress={() => Linking.openURL(url)}
          >
            {url}
          </Text>
          {onRemove && (
            <Pressable
              style={({ pressed }) => [styles.removeBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
              onPress={onRemove}
            >
              <Ionicons name="close" size={16} color={theme.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const domain = metadata.domain || new URL(url).hostname;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surfaceContainer, opacity: pressed ? 0.9 : 1 }]}
      onPress={() => Linking.openURL(url)}
    >
      {metadata.image && (
        <Image
          source={{ uri: metadata.image }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.domainRow}>
          {metadata.favicon ? (
            <Image source={{ uri: metadata.favicon }} style={styles.favicon} />
          ) : (
            <View style={[styles.faviconFallback, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="globe-outline" size={14} color={theme.onPrimaryContainer} />
            </View>
          )}
          <Text style={[styles.domain, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
            {domain}
          </Text>
          {onEditTitle && (
            <Pressable
              onPress={() => onEditTitle(metadata.title || '')}
              style={styles.editBtn}
              hitSlop={8}
            >
              <Ionicons name="pencil-outline" size={14} color={theme.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.title, { color: theme.onSurface }]} numberOfLines={2}>
          {metadata.title || url}
        </Text>
        {metadata.description && (
          <Text style={[styles.description, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
            {metadata.description}
          </Text>
        )}
      </View>
      {onRemove && (
        <Pressable
          style={({ pressed }) => [styles.removeBtn, { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 }]}
          onPress={() => onRemove()}
          hitSlop={8}
        >
          <Ionicons name="close" size={16} color={theme.onSurfaceVariant} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favicon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  faviconFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domain: {
    fontSize: m3Typography.labelMedium.fontSize,
    flex: 1,
  },
  editBtn: {
    padding: 4,
  },
  title: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  description: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: 20,
  },
  errorContent: {
    padding: 24,
    alignItems: 'center',
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: m3Typography.bodyMedium.fontSize,
  },
  urlText: {
    fontSize: m3Typography.labelMedium.fontSize,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
