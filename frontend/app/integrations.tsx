import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import M3Button from '../components/ui/M3Button';
import M3TextField from '../components/ui/M3TextField';
import M3BottomSheet from '../components/ui/M3BottomSheet';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning } from '../utils/haptics';
import { getBackendUrlSync, setBackendUrl, resetBackendUrl } from '../utils/backend';

let useDialog: any;
try { useDialog = require('../components/ui/DialogProvider').useDialog; } catch {}

export default function IntegrationsScreen() {
  const BACKEND_URL = getBackendUrlSync();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [backendUrlInput, setBackendUrlInput] = useState(BACKEND_URL);
  const [saving, setSaving] = useState(false);

  let dialog: any = null;
  try { if (useDialog) dialog = useDialog(); } catch {}

  const fetchData = async () => {
    const BACKEND_URL = getBackendUrlSync();
    try {
      const [configRes, healthRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/ai-config`).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/health`).catch(() => ({ data: null })),
      ]);
      setConfig(configRes.data);
      setHealth(healthRes.data);
    } catch (e) {
      console.error('Failed to load integrations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(() => {
    hapticLight();
    setRefreshing(true);
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    const BACKEND_URL = getBackendUrlSync();
    if (!apiKey.trim()) return;
    hapticPress();
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/ai-config`, {
        openai_api_key: apiKey.trim(),
        model: model.trim() || 'gpt-4o-mini',
      });
      hapticSuccess();
      setShowConfigModal(false);
      setApiKey('');
      if (dialog) dialog.showAlert('Success', 'AI configuration updated.');
      fetchData();
    } catch (e: any) {
      hapticWarning();
      if (dialog) dialog.showAlert('Error', e?.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const dbStatus = health?.database?.status === 'connected';
  const aiConfigured = config?.has_api_key || config?.configured;

  const StatusCard = ({
    icon,
    label,
    desc,
    status,
    statusColor,
    containerColor,
    onPress,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    desc: string;
    status: string;
    statusColor: string;
    containerColor: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statusCard, { backgroundColor: theme.surfaceContainer }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statusIcon, { backgroundColor: containerColor }]}>
        <MaterialIcons name={icon} size={20} color={statusColor} />
      </View>
      <View style={styles.statusContent}>
        <Text style={[styles.statusLabel, { color: theme.onSurface }]}>{label}</Text>
        <Text style={[styles.statusDesc, { color: theme.onSurfaceVariant }]}>{desc}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: containerColor }]}>
        <Text style={[styles.statusBadgeText, { color: statusColor }]}>{status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.surface, paddingTop: insets.top }]}>
        <M3Progress size="large" />
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Integrations</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>System config</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* System Health */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>System Health</Text>
          <StatusCard
            icon="storage"
            label="Database"
            desc={`MongoDB — ${health?.database?.status || 'unknown'}`}
            status={dbStatus ? 'ONLINE' : 'OFFLINE'}
            statusColor={dbStatus ? theme.success : theme.error}
            containerColor={dbStatus ? theme.successContainer : theme.errorContainer}
          />
          <StatusCard
            icon="memory"
            label="Backend"
            desc={`v${health?.version || '0.1.0'} — ${health?.status || 'unknown'}`}
            status={health?.status === 'healthy' ? 'RUNNING' : 'CHECK'}
            statusColor={health?.status === 'healthy' ? theme.success : theme.warning}
            containerColor={health?.status === 'healthy' ? theme.successContainer : theme.warningContainer}
          />
        </Animated.View>

        {/* AI Configuration */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>AI Configuration</Text>
          <StatusCard
            icon="psychology"
            label="OpenAI"
            desc={aiConfigured ? `Model: ${config?.model || 'gpt-4o-mini'}` : 'Not configured'}
            status={aiConfigured ? 'ACTIVE' : 'SETUP'}
            statusColor={aiConfigured ? theme.success : theme.warning}
            containerColor={aiConfigured ? theme.successContainer : theme.warningContainer}
            onPress={() => { hapticPress(); setShowConfigModal(true); }}
          />
        </Animated.View>

        {/* Backend URL */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Connection</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.surfaceContainer }]}>
            <Text style={[styles.infoLabel, { color: theme.onSurfaceVariant }]}>Backend URL</Text>
            <View style={styles.urlRow}>
              <TextInput
                style={[styles.urlInput, {
                  color: theme.onSurface,
                  backgroundColor: theme.surfaceContainerHigh,
                }]}
                value={backendUrlInput}
                onChangeText={setBackendUrlInput}
                placeholder="https://your-tunnel-url.trycloudflare.com"
                placeholderTextColor={theme.onSurfaceVariant}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={async () => {
                  if (backendUrlInput && backendUrlInput !== BACKEND_URL) {
                    await setBackendUrl(backendUrlInput);
                    hapticSuccess();
                    if (dialog) dialog.showAlert('Updated', 'Backend URL updated. Pull to refresh any screen.');
                  }
                }}
              />
              <TouchableOpacity
                onPress={async () => {
                  await resetBackendUrl();
                  setBackendUrlInput(getBackendUrlSync());
                  hapticLight();
                  if (dialog) dialog.showAlert('Reset', 'Backend URL reset to default.');
                }}
                style={[styles.resetBtn, { backgroundColor: theme.surfaceContainerHigh }]}
              >
                <MaterialIcons name="refresh" size={20} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.onSurfaceVariant }]}>Version</Text>
              <Text style={[styles.infoValue, { color: theme.onSurface }]}>
                {health?.version || '0.1.0'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Config Bottom Sheet */}
      <M3BottomSheet
        visible={showConfigModal}
        onDismiss={() => setShowConfigModal(false)}
        snapPoints={[0.6]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContent}
        >
          <Text style={[styles.sheetTitle, { color: theme.onSurface }]}>AI Configuration</Text>

          <M3TextField
            label="OpenAI API Key"
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            secureTextEntry
          />

          <View style={{ height: spacing.md }} />

          <M3TextField
            label="Model"
            value={model}
            onChangeText={setModel}
            placeholder="gpt-4o-mini"
          />

          <View style={{ height: spacing.xl }} />

          <M3Button
            label="Save"
            variant="filled"
            onPress={handleSaveConfig}
            disabled={!apiKey.trim() || saving}
            loading={saving}
            fullWidth
          />
        </KeyboardAvoidingView>
      </M3BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  /* Status Card */
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: { flex: 1 },
  statusLabel: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  statusBadgeText: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Info Card */
  infoCard: {
    borderRadius: m3Radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
  },
  infoValue: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '600',
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  urlInput: {
    flex: 1,
    borderRadius: m3Radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: m3Typography.bodySmall.fontSize,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sheet */
  sheetContent: {
    padding: spacing.lg,
  },
  sheetTitle: {
    fontSize: m3Typography.headlineSmall.fontSize,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
});
