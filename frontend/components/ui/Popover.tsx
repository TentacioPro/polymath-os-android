import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Radii, m3Typography } from '../../../shared/design-tokens';
import { spacing } from '../../theme';

export interface PopoverAction {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /**
   * Screen-space position of the trigger element.
   * Pass `{ x, y, width, height }` from `onLayout` + `measure`.
   */
  anchor: { x: number; y: number; width: number; height: number } | null;
  actions: PopoverAction[];
}

/**
 * Non-blocking Popover for mobile.
 * Per Hick's Law: use for simple (non-destructive) actions only.
 * Destructive actions should use a Modal/Dialog instead.
 */
export function Popover({ open, onClose, anchor, actions }: PopoverProps) {
  const { theme } = useTheme();

  if (!open || !anchor) return null;

  const top = anchor.y + anchor.height + 4;
  // Position near right edge of screen but avoid overflow
  const right = 16;

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.popover,
          { top, right, backgroundColor: theme.surfaceContainerHighest },
        ]}
      >
        {actions.map((action, i) => (
          <Pressable
            key={i}
            onPress={() => { onClose(); action.onPress(); }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.8 : 1 }]}
            accessibilityRole="menuitem"
          >
            <MaterialIcons
              name={action.icon as any}
              size={18}
              color={action.variant === 'danger' ? theme.error : theme.onSurfaceVariant}
            />
            <Text
              style={[
                styles.label,
                { color: action.variant === 'danger' ? theme.error : theme.onSurface },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    borderRadius: m3Radii.xl,
    minWidth: 160,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    gap: spacing.sm,
  },
  label: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '500',
  },
});
