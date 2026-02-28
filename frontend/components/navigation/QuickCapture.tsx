import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, spacing, fs, sw } from '../../theme';

interface QuickCaptureProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (text: string) => void;
}

const MAX_CHARS = 280;

const ACTION_BUTTONS = [
  { icon: 'mic' as const, label: 'Voice' },
  { icon: 'link' as const, label: 'Link' },
  { icon: 'photo-camera' as const, label: 'Scan' },
  { icon: 'attach-file' as const, label: 'File' },
];

/**
 * Quick Capture bottom sheet overlay.
 * Triggered by the FAB (+) in the floating pill.
 * Uses drawer palette for consistent dark appearance across themes.
 */
export default function QuickCapture({ visible, onClose, onSubmit }: QuickCaptureProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');

  if (!visible) return null;

  const d = theme.drawer;

  const handleSubmit = () => {
    if (text.trim() && onSubmit) {
      onSubmit(text.trim());
    }
    setText('');
    onClose();
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: d.overlay }]}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: d.background,
              borderTopColor: d.border,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: d.textSecondary + '40' }]} />
          </View>

          <View style={styles.labelRow}>
            <MaterialIcons name="edit" size={fs(14)} color={d.textPrimary} />
            <Text style={[styles.labelText, { color: d.textPrimary }]}>Quick Capture</Text>
          </View>

          <View style={[styles.inputContainer, { borderColor: d.border, borderRadius: 8 }]}>
            <TextInput
              style={[styles.input, { color: d.textPrimary }]}
              placeholder="What did you learn?"
              placeholderTextColor={d.textSecondary}
              multiline
              maxLength={MAX_CHARS}
              value={text}
              onChangeText={setText}
            />
            <Text style={[styles.charCount, { color: d.textSecondary }]}>
              {text.length}/{MAX_CHARS}
            </Text>
          </View>

          <View style={styles.actionsGrid}>
            {ACTION_BUTTONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionItem, { borderColor: d.border, borderRadius: 8 }]}
                activeOpacity={0.7}
              >
                <MaterialIcons name={action.icon} size={fs(18)} color={d.textPrimary} />
                <Text style={[styles.actionLabel, { color: d.textPrimary }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: theme.accent,
                borderRadius: 8,
                opacity: text.trim().length > 0 ? 1 : 0.4,
              },
            ]}
            onPress={handleSubmit}
            disabled={!text.trim()}
          >
            <Text style={[styles.submitLabel, { color: theme.accentContrast }]}>
              Capture to Inbox
            </Text>
          </TouchableOpacity>

          <Text style={[styles.target, { color: d.textSecondary }]}>
            Target: /Inbox/Unsorted
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: spacing.xl,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  labelText: {
    fontSize: fs(11),
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inputContainer: {
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 120,
  },
  input: {
    fontSize: fs(14),
    lineHeight: 20,
    flex: 1,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: fs(10),
    textAlign: 'right',
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionItem: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: fs(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  submitBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  submitLabel: {
    fontSize: fs(11),
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  target: {
    fontSize: fs(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
});
