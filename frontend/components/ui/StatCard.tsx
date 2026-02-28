import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  const bg = inverted ? theme.accent : theme.surface;
  const textColor = inverted ? theme.accentContrast : theme.textPrimary;
  const mutedColor = inverted ? theme.accentContrast + '99' : theme.textSecondary;
  const borderColor = inverted ? 'transparent' : theme.border;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor }]}>
      <View style={styles.topRow}>
        {icon}
        {badge && (
          <View style={[styles.badge, { backgroundColor: inverted ? theme.background : theme.accent }]}>
            <Text
              style={[
                styles.badgeText,
                { color: inverted ? theme.accent : theme.accentContrast, fontFamily: theme.fontMono },
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
    borderRadius: 10,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 100,
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
