import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme, spacing } from '../../theme';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  /** True to use inverted (accent bg) style like the "Streak" card */
  inverted?: boolean;
  /** Optional badge text (e.g. "NEW") */
  badge?: string;
}

/**
 * Dashboard bento stat cell. Maps to Stitch prd_6 stat squares.
 */
export default function StatCard({ value, label, icon, inverted, badge }: StatCardProps) {
  const { theme } = useTheme();

  const bg = inverted ? theme.primary : theme.surface;
  const textColor = inverted ? theme.onPrimary : theme.onSurface;
  const mutedColor = inverted ? theme.onPrimary + '99' : theme.onSurfaceVariant;
  const borderColor = inverted ? 'transparent' : theme.outlineVariant;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg,
          borderColor,
          ...(inverted
            ? Platform.select({
                ios: {
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                },
                android: { elevation: 6 },
              })
            : {}),
        },
      ]}
    >
      <View style={styles.topRow}>
        {icon}
        {badge && (
          <View style={[styles.badge, { backgroundColor: inverted ? theme.surface : theme.primary }]}>
            <Text
              style={[
                styles.badgeText,
                { color: inverted ? theme.primary : theme.onPrimary, fontFamily: theme.fontMono },
              ]}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.bottomRow}>
        <Text style={[styles.value, { color: textColor, fontFamily: theme.fontDisplay }]}>
          {value}
        </Text>
        <Text style={[styles.label, { color: mutedColor, fontFamily: theme.fontMono }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 96,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bottomRow: {
    marginTop: 'auto',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
