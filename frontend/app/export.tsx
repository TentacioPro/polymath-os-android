import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { Paths, File as ExpoFile } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import M3Button from '../components/ui/M3Button';
import M3Progress from '../components/ui/M3Progress';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

let useDialog: any;
try { useDialog = require('../components/ui/DialogProvider').useDialog; } catch {}

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

  let dialog: any = null;
  try { if (useDialog) dialog = useDialog(); } catch {}

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
      if (dialog) dialog.showAlert('Export Complete', `Exported as ${fmt.label} successfully.`);
    } catch (err: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Export Failed', err?.message || 'Could not export data.');
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
      if (dialog) dialog.showAlert('Import Complete', `Restored: ${JSON.stringify(res.data)}`);
    } catch (err: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Import Failed', err?.message || 'Could not import data.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Export</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>Knowledge package</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Format Selection */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Format</Text>
          <View style={styles.formatGrid}>
            {EXPORT_FORMATS.map((fmt, i) => {
              const isSelected = selectedFormat === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.formatCard,
                    {
                      backgroundColor: isSelected ? theme.primaryContainer : theme.surfaceContainer,
                    },
                  ]}
                  onPress={() => { hapticSelection(); setSelectedFormat(i); }}
                >
                  <MaterialIcons
                    name={fmt.icon}
                    size={24}
                    color={isSelected ? theme.onPrimaryContainer : theme.onSurfaceVariant}
                  />
                  <Text style={[styles.formatLabel, {
                    color: isSelected ? theme.onPrimaryContainer : theme.onSurface,
                  }]}>
                    {fmt.label}
                  </Text>
                  <Text style={[styles.formatExt, {
                    color: isSelected ? theme.onPrimaryContainer : theme.onSurfaceVariant,
                  }]}>
                    {fmt.ext}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                      <MaterialIcons name="check" size={12} color={theme.onPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Scope */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Scope</Text>
          <View style={[styles.scopeCard, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.scopeText, { color: theme.onSurfaceVariant }]}>
              Export includes all activities, journals, connections, and synthesis data.
            </Text>
          </View>
        </Animated.View>

        {/* Export Button */}
        <View style={{ marginTop: spacing.xl }}>
          <M3Button
            label="Generate Export"
            variant="filled"
            icon="file-download"
            onPress={handleExport}
            disabled={exporting}
            loading={exporting}
            fullWidth
          />
        </View>

        {/* Import Section */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Import</Text>
          <View style={[styles.scopeCard, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.scopeText, { color: theme.onSurfaceVariant, marginBottom: spacing.md }]}>
              Restore your knowledge graph from a previous JSON export.
            </Text>
            <M3Button
              label="Import JSON Backup"
              variant="outlined"
              icon="file-upload"
              onPress={handleImport}
              disabled={importing}
              loading={importing}
              fullWidth
            />
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 2,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.xl,
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
    borderRadius: m3Radii.xl,
    gap: spacing.xs,
    position: 'relative',
  },
  formatLabel: {
    fontSize: m3Typography.titleSmall.fontSize,
    fontWeight: '600',
  },
  formatExt: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scope */
  scopeCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
  },
  scopeText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
  },
});
