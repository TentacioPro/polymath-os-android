import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              System Diagnostics
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Analytics
            </ThemedText>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Overview" icon="bar-chart" />
          <View style={styles.statsGrid}>
            <StatCard label="TOTAL INGESTED" value="—" />
            <StatCard label="CONNECTIONS" value="—" />
            <StatCard label="SYNTHESIS" value="—" inverted />
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Activity" icon="timeline" />
          <BentoCard padding="lg">
            <View style={styles.placeholder}>
              <MaterialIcons name="insights" size={40} color={theme.textMuted} />
              <ThemedText variant="body" color="muted" style={{ marginTop: spacing.md, textAlign: 'center' }}>
                Activity timeline and charts will appear here as you use the system.
              </ThemedText>
            </View>
          </BentoCard>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scrollContent: { gap: sw(16) },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: sw(8),
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
}));
