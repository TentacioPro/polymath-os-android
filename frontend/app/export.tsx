import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import ArchitectButton from '../components/ui/ArchitectButton';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const EXPORT_FORMATS = [
  { icon: 'description' as const, label: 'Markdown', ext: '.md', endpoint: '/api/export/markdown' },
  { icon: 'code' as const, label: 'JSON', ext: '.json', endpoint: '/api/export/json' },
  { icon: 'grid-on' as const, label: 'CSV', ext: '.csv', endpoint: '/api/export/csv' },
  { icon: 'text-snippet' as const, label: 'Plain Text', ext: '.txt', endpoint: '/api/export/markdown' },
];

export default function ExportScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    const fmt = EXPORT_FORMATS[selectedFormat];
    setExporting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}${fmt.endpoint}`);
      const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      const fileName = `polymath_export_${Date.now()}${fmt.ext}`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        await Share.share({ message: content, title: `Polymath Export (${fmt.label})` });
      }
      Alert.alert('Export Complete', `Exported as ${fmt.label} successfully.`);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Could not export data.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const { File } = await import('expo-file-system/next');
      const file = await File.pickFileAsync({ types: ['application/json'] });
      if (!file) return;
      setImporting(true);
      const content = await file.text();
      const data = JSON.parse(content);
      const res = await axios.post(`${BACKEND_URL}/api/import/restore`, data);
      Alert.alert('Import Complete', `Restored: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      Alert.alert('Import Failed', err?.message || 'Could not import data.');
    } finally {
      setImporting(false);
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
            label={exporting ? 'Exporting...' : 'Generate Export'}
            onPress={handleExport}
            variant="primary"
            disabled={exporting}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Import / Restore" icon="upload-file" />
          <BentoCard padding="lg">
            <ThemedText variant="body" color="secondary" style={{ marginBottom: spacing.md }}>
              Restore your full knowledge graph from a previous JSON export.
            </ThemedText>
            <ArchitectButton
              label={importing ? 'Importing...' : 'Import JSON Backup'}
              onPress={handleImport}
              variant="outline"
              disabled={importing}
            />
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
