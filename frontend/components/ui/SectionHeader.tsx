import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

interface SectionHeaderProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Right-side accessory */
  right?: React.ReactNode;
}

/**
 * Mono uppercase section label with optional icon.
 * Maps to Stitch's `font-mono text-[10px] uppercase tracking-widest` pattern.
 */
export default function SectionHeader({ label, icon, right }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && (
          <MaterialIcons name={icon} size={14} color={theme.textSecondary} style={styles.icon} />
        )}
        <Text
          style={[
            styles.label,
            {
              color: theme.textSecondary,
              fontFamily: theme.fontMono,
            },
          ]}
        >
          {label}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
