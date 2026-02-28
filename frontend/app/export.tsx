import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import ArchitectButton from '../components/ui/ArchitectButton';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const EXPORT_FORMATS = [
  { icon: 'description' as const, label: 'Markdown', ext: '.md' },
  { icon: 'code' as const, label: 'JSON', ext: '.json' },
  { icon: 'picture-as-pdf' as const, label: 'PDF', ext: '.pdf' },
  { icon: 'text-snippet' as const, label: 'Plain Text', ext: '.txt' },
];

export default function ExportScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();
  const [selectedFormat, setSelectedFormat] = useState(0);

  const handleExport = async () => {
    try {
      await Share.share({
        message: 'Polymath OS Export — Deep Structure Knowledge Graph',
        title: 'Export Knowledge',
      });
    } catch (err) {
      Alert.alert('Export', 'Export functionality coming soon.');
    }
  };

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              Knowledge Package
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Export
            </ThemedText>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Format" icon="file-copy" />
          <View style={styles.formatGrid}>
            {EXPORT_FORMATS.map((fmt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedFormat(i)}
                style={{ flex: 1 }}
              >
                <BentoCard
                  padding="md"
                  inverted={selectedFormat === i}
                >
                  <View style={styles.formatCard}>
                    <MaterialIcons
                      name={fmt.icon}
                      size={24}
                      color={selectedFormat === i ? theme.accentContrast : theme.accent}
                    />
                    <Text
                      style={[
                        styles.formatLabel,
                        {
                          color: selectedFormat === i
                            ? theme.accentContrast
                            : theme.textPrimary,
                        },
                      ]}
                    >
                      {fmt.label}
                    </Text>
                    <Text
                      style={[
                        styles.formatExt,
                        {
                          color: selectedFormat === i
                            ? theme.accentContrast
                            : theme.textMuted,
                        },
                      ]}
                    >
                      {fmt.ext}
                    </Text>
                  </View>
                </BentoCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Scope" icon="filter-alt" />
          <BentoCard padding="lg">
            <ThemedText variant="body" color="secondary">
              Export will include all ingested activities, journals, connections, and synthesis data from your knowledge graph.
            </ThemedText>
          </BentoCard>
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <ArchitectButton
            label="Generate Export"
            onPress={handleExport}
            variant="primary"
          />
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
  formatGrid: {
    flexDirection: 'row',
    gap: sw(8),
  },
  formatCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: sw(8),
  },
  formatLabel: {
    fontSize: fs(11),
    fontWeight: '700',
  },
  formatExt: {
    fontSize: fs(9),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
