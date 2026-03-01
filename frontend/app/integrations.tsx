import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticPress, hapticSuccess, hapticWarning } from '../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function IntegrationsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [saving, setSaving] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  const fetchData = async () => {
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
      Alert.alert('Success', 'AI configuration updated.');
      fetchData();
    } catch (e: any) {
      hapticWarning();
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to save configuration');
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
    onPress,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    desc: string;
    status: string;
    statusColor: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statusCard, { backgroundColor: surface, borderColor: border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statusIcon, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={20} color={statusColor} />
      </View>
      <View style={styles.statusContent}>
        <Text style={[styles.statusLabel, { color: text }]}>{label}</Text>
        <Text style={[styles.statusDesc, { color: textMuted }]}>{desc}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <Text style={[styles.statusBadgeText, { color: statusColor }]}>{status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

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
          <Text style={[styles.title, { color: text }]}>Integrations</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>System config</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* System Health */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>SYSTEM HEALTH</Text>
        <StatusCard
          icon="storage"
          label="Database"
          desc={`MongoDB — ${health?.database?.status || 'unknown'}`}
          status={dbStatus ? 'ONLINE' : 'OFFLINE'}
          statusColor={dbStatus ? '#00FF94' : '#FF4444'}
        />
        <StatusCard
          icon="memory"
          label="Backend"
          desc={`v${health?.version || '0.1.0'} — ${health?.status || 'unknown'}`}
          status={health?.status === 'healthy' ? 'RUNNING' : 'CHECK'}
          statusColor={health?.status === 'healthy' ? '#00FF94' : '#FFB800'}
        />

        {/* AI Configuration */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>AI CONFIGURATION</Text>
        <StatusCard
          icon="psychology"
          label="OpenAI"
          desc={aiConfigured ? `Model: ${config?.model || 'gpt-4o-mini'}` : 'Not configured'}
          status={aiConfigured ? 'ACTIVE' : 'SETUP'}
          statusColor={aiConfigured ? '#00FF94' : '#FFB800'}
          onPress={() => { hapticPress(); setShowConfigModal(true); }}
        />

        {/* Info */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>INFO</Text>
        <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textMuted }]}>Backend URL</Text>
            <Text style={[styles.infoValue, { color: text }]} numberOfLines={1}>
              {BACKEND_URL}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textMuted }]}>Version</Text>
            <Text style={[styles.infoValue, { color: text }]}>{health?.version || '0.1.0'}</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Config Modal */}
      <Modal visible={showConfigModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: surface, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>AI Configuration</Text>
              <TouchableOpacity onPress={() => { hapticLight(); setShowConfigModal(false); }}>
                <MaterialIcons name="close" size={24} color={text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: textMuted }]}>OpenAI API Key *</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="sk-..."
              placeholderTextColor={textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />

            <Text style={[styles.label, { color: textMuted }]}>Model</Text>
            <TextInput
              style={[styles.input, { color: text, borderColor: border, backgroundColor: bg }]}
              placeholder="gpt-4o-mini"
              placeholderTextColor={textMuted}
              value={model}
              onChangeText={setModel}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accent, opacity: apiKey.trim() && !saving ? 1 : 0.5 }]}
              onPress={handleSaveConfig}
              disabled={!apiKey.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <Text style={[styles.saveBtnText, { color: theme.accentContrast }]}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  /* Status Card */
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  statusIcon: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: { flex: 1 },
  statusLabel: { fontSize: fs(14), fontWeight: '600' },
  statusDesc: { fontSize: fs(12), marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: fs(9), fontWeight: '700', letterSpacing: 0.5 },

  /* Info */
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: fs(13) },
  infoValue: { fontSize: fs(13), fontWeight: '600', flex: 1, textAlign: 'right' },

  /* Modal */
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: fs(18), fontWeight: '700' },
  label: { fontSize: fs(11), textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: fs(15) },
  saveBtn: { paddingVertical: spacing.lg, borderRadius: 12, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontSize: fs(14), fontWeight: '700' },
});
