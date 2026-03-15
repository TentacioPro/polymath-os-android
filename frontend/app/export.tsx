import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Paths, File as ExpoFile } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';

import { getBackendUrlSync } from '../utils/backend';

const EXPORT_FORMATS = [
  { icon: 'description' as const, label: 'Markdown', ext: '.md', endpoint: '/api/export/markdown' },
  { icon: 'code' as const, label: 'JSON', ext: '.json', endpoint: '/api/export/json' },
  { icon: 'grid-on' as const, label: 'CSV', ext: '.csv', endpoint: '/api/export/csv' },
  { icon: 'text-snippet' as const, label: 'Text', ext: '.txt', endpoint: '/api/export/markdown' },
];

export default function ExportScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  const handleExport = async () => {
    const BACKEND_URL = getBackendUrlSync();
    const fmt = EXPORT_FORMATS[selectedFormat];
    hapticPress();
    setExporting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}${fmt.endpoint}`);
      const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      const fileName = `polymath_export_${Date.now()}${fmt.ext}`;
      const file = new ExpoFile(Paths.cache, fileName);
      await file.write(content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        await Share.share({ message: content, title: `Polymath Export (${fmt.label})` });
      }
      hapticSuccess();
      Alert.alert('Export Complete', `Exported as ${fmt.label} successfully.`);
    } catch (err: any) {
      hapticWarning();
      Alert.alert('Export Failed', err?.message || 'Could not export data.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    const BACKEND_URL = getBackendUrlSync();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      hapticPress();
      setImporting(true);
      const file = new ExpoFile(asset.uri);
      const content = await file.text();
      const data = JSON.parse(content);
      const res = await axios.post(`${BACKEND_URL}/api/import/restore`, data);
      hapticSuccess();
      Alert.alert('Import Complete', `Restored: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      hapticWarning();
      Alert.alert('Import Failed', err?.message || 'Could not import data.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Export</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Knowledge package</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Format Selection */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>FORMAT</Text>
        <View style={styles.formatGrid}>
          {EXPORT_FORMATS.map((fmt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.formatCard,
                {
                  backgroundColor: selectedFormat === i ? accent : surface,
                  borderColor: border,
                },
              ]}
              onPress={() => { hapticSelection(); setSelectedFormat(i); }}
            >
              <MaterialIcons
                name={fmt.icon}
                size={24}
                color={selectedFormat === i ? theme.accentContrast : accent}
              />
              <Text
                style={[
                  styles.formatLabel,
                  { color: selectedFormat === i ? theme.accentContrast : text },
                ]}
              >
                {fmt.label}
              </Text>
              <Text
                style={[
                  styles.formatExt,
                  { color: selectedFormat === i ? theme.accentContrast : textMuted },
                ]}
              >
                {fmt.ext}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Scope */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>SCOPE</Text>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.scopeText, { color: textMuted }]}>
            Export includes all activities, journals, connections, and synthesis data.
          </Text>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: accent, opacity: exporting ? 0.6 : 1 }]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.accentContrast} />
          ) : (
            <>
              <MaterialIcons name="file-download" size={18} color={theme.accentContrast} />
              <Text style={[styles.exportBtnText, { color: theme.accentContrast }]}>
                Generate Export
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Import Section */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>IMPORT</Text>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.scopeText, { color: textMuted, marginBottom: spacing.md }]}>
            Restore your knowledge graph from a previous JSON export.
          </Text>
          <TouchableOpacity
            style={[styles.importBtn, { borderColor: accent, opacity: importing ? 0.6 : 1 }]}
            onPress={handleImport}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <>
                <MaterialIcons name="file-upload" size={18} color={accent} />
                <Text style={[styles.importBtnText, { color: accent }]}>Import JSON Backup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: fs(20), fontWeight: '700' },
  subtitle: { fontSize: fs(12), marginTop: 2 },
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Format Grid */
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formatCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
  },
  formatLabel: { fontSize: fs(13), fontWeight: '600' },
  formatExt: { fontSize: fs(11) },

  /* Card */
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  scopeText: { fontSize: fs(13), lineHeight: 19 },

  /* Buttons */
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 14,
    marginTop: spacing.lg,
  },
  exportBtnText: { fontSize: fs(14), fontWeight: '700' },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  importBtnText: { fontSize: fs(13), fontWeight: '600' },
});
