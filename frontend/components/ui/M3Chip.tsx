import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../../shared/design-tokens';

interface M3ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  color?: string;
  variant?: 'filter' | 'suggestion' | 'input';
  style?: ViewStyle;
}

export default function M3Chip({
  label,
  selected = false,
  onPress,
  icon,
  color,
  variant = 'filter',
  style,
}: M3ChipProps) {
  const { theme } = useTheme();

  const bg = selected ? theme.primaryContainer : theme.surfaceContainerHigh;
  const textColor = selected ? theme.onPrimaryContainer : theme.onSurfaceVariant;
  const tintColor = color || textColor;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      {...(onPress ? { hitSlop: { top: 6, bottom: 6, left: 8, right: 8 } } : {})}
      style={[
        styles.chip,
        { backgroundColor: bg },
        style,
      ]}
    >
      {selected && variant === 'filter' && (
        <Ionicons name="checkmark" size={14} color={textColor} />
      )}
      {icon && !selected && (
        <Ionicons name={icon as any} size={14} color={tintColor} />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: m3Radii.full,
  },
  label: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '500',
  },
});
