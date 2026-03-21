import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { m3Typography } from '../../../shared/design-tokens';

type UploadState = 'selected' | 'uploading' | 'processing' | 'success' | 'error';

interface FileUploadProps {
  fileName: string;
  fileSize: number;
  fileType: string;
  onUpload: () => Promise<void>;
  onCancel?: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
  progress?: number; // 0-100
  errorMessage?: string;
}

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'document-text', color: '#E57373' },
  json: { icon: 'code-slash', color: '#64B5F6' },
  txt: { icon: 'document', color: '#90A4AE' },
  image: { icon: 'image', color: '#81C784' },
  default: { icon: 'document-outline', color: '#90A4AE' },
};

function getFileIcon(type: string) {
  if (type.includes('pdf')) return FILE_ICONS.pdf;
  if (type.includes('json')) return FILE_ICONS.json;
  if (type.includes('text')) return FILE_ICONS.txt;
  if (type.includes('image')) return FILE_ICONS.image;
  return FILE_ICONS.default;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  fileName,
  fileSize,
  fileType,
  onUpload,
  onCancel,
  onRetry,
  onDismiss,
  progress = 0,
  errorMessage,
}: FileUploadProps) {
  const { theme } = useTheme();
  const [state, setState] = useState<UploadState>('selected');
  const progressWidth = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const fileIcon = getFileIcon(fileType);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleUpload = useCallback(async () => {
    setState('uploading');
    try {
      // Simulate progress animation
      progressWidth.value = withTiming(90, { duration: 2000, easing: Easing.out(Easing.cubic) });
      await onUpload();
      progressWidth.value = withTiming(100, { duration: 200 });
      setState('processing');
      // Simulate processing
      setTimeout(() => {
        setState('success');
        checkScale.value = withSpring(1, { damping: 8, stiffness: 150 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 800);
    } catch {
      setState('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [onUpload]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceContainer }]}>
      {/* File info header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: fileIcon.color + '22' }]}>
          <Ionicons name={fileIcon.icon as any} size={24} color={fileIcon.color} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: theme.onSurface }]} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={[styles.fileSize, { color: theme.onSurfaceVariant }]}>
            {formatSize(fileSize)}
          </Text>
        </View>
      </View>

      {/* State-specific content */}
      {state === 'selected' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.actions}>
          <Text style={[styles.statusText, { color: theme.onSurfaceVariant }]}>
            Ready to upload
          </Text>
          <TouchableOpacity
            style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
            onPress={handleUpload}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={theme.onPrimary} />
            <Text style={[styles.uploadLabel, { color: theme.onPrimary }]}>Upload</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {state === 'uploading' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceContainerHigh }]}>
            <Animated.View
              style={[styles.progressFill, { backgroundColor: theme.primary }, progressStyle]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: theme.onSurfaceVariant }]}>
              {Math.round(progress)}%
            </Text>
            {onCancel && (
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={onCancel}
              >
                <Ionicons name="close" size={16} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {state === 'processing' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.processingRow}>
          <View style={[styles.spinner, { borderColor: theme.primary, borderTopColor: 'transparent' }]} />
          <Text style={[styles.statusText, { color: theme.onSurfaceVariant }]}>
            Analyzing...
          </Text>
        </Animated.View>
      )}

      {state === 'success' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.successRow}>
          <Animated.View style={[styles.checkCircle, { backgroundColor: theme.success + '22' }, checkStyle]}>
            <Ionicons name="checkmark" size={20} color={theme.success} />
          </Animated.View>
          <Text style={[styles.statusText, { color: theme.success }]}>
            Saved to knowledge base
          </Text>
        </Animated.View>
      )}

      {state === 'error' && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.errorSection}>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={20} color={theme.error} />
            <Text style={[styles.statusText, { color: theme.error }]}>
              {errorMessage || 'Upload failed'}
            </Text>
          </View>
          {onRetry && (
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.errorContainer }]}
              onPress={() => { setState('selected'); onRetry(); }}
            >
              <Text style={[styles.retryLabel, { color: theme.error }]}>Retry</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: m3Typography.labelMedium.fontSize,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: m3Typography.bodyMedium.fontSize,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  uploadLabel: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  progressSection: {
    gap: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: m3Typography.labelMedium.fontSize,
  },
  cancelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorSection: {
    gap: 10,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  retryLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
  },
});
