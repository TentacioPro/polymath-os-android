import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import SafeView from '../components/shared/SafeView';
import BentoCard from '../components/ui/BentoCard';
import SectionHeader from '../components/ui/SectionHeader';
import ThemedText from '../components/shared/ThemedText';
import Badge from '../components/ui/Badge';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function IntegrationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSaveConfig = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/api/ai-config`, {
        openai_api_key: apiKey.trim(),
        model: model.trim() || 'gpt-4o-mini',
      });
      setShowConfigModal(false);
      setApiKey('');
      Alert.alert('Success', 'AI configuration updated.');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const dbStatus = health?.database?.status === 'connected';
  const aiConfigured = config?.has_api_key || config?.configured;

  return (
    <SafeView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              System Config
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Integrations
            </ThemedText>
          </View>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : (
          <>
            {/* System Health */}
            <View style={{ paddingHorizontal: spacing.xl }}>
              <SectionHeader label="System Health" icon="monitor-heart" />
              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.integRow}>
                  <View style={[styles.integIcon, { borderColor: theme.border }]}>
                    <MaterialIcons name="storage" size={20} color={dbStatus ? '#00FF94' : '#FF4444'} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.integLabel, { color: theme.textPrimary }]}>Database</Text>
                    <Text style={[styles.integDesc, { color: theme.textSecondary }]}>
                      MongoDB — {health?.database?.status || 'unknown'}
                    </Text>
                  </View>
                  <Badge
                    label={dbStatus ? 'ONLINE' : 'OFFLINE'}
                    variant="status"
                    color={dbStatus ? '#00FF94' : '#FF4444'}
                  />
                </View>
              </BentoCard>

              <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.integRow}>
                  <View style={[styles.integIcon, { borderColor: theme.border }]}>
                    <MaterialIcons name="memory" size={20} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.integLabel, { color: theme.textPrimary }]}>Backend</Text>
                    <Text style={[styles.integDesc, { color: theme.textSecondary }]}>
                      v{health?.version || '0.1.0'} — {health?.status || 'unknown'}
                    </Text>
                  </View>
                  <Badge
                    label={health?.status === 'healthy' ? 'RUNNING' : 'CHECK'}
                    variant="status"
                    color={health?.status === 'healthy' ? '#00FF94' : '#FFB800'}
                  />
                </View>
              </BentoCard>
            </View>

            {/* AI Configuration */}
            <View style={{ paddingHorizontal: spacing.xl }}>
              <SectionHeader label="AI Configuration" icon="psychology" />
              <TouchableOpacity onPress={() => setShowConfigModal(true)}>
                <BentoCard padding="md" style={{ marginBottom: spacing.sm }}>
                  <View style={styles.integRow}>
                    <View style={[styles.integIcon, { borderColor: theme.border }]}>
                      <MaterialIcons name="auto-awesome" size={20} color={theme.accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={[styles.integLabel, { color: theme.textPrimary }]}>OpenAI</Text>
                      <Text style={[styles.integDesc, { color: theme.textSecondary }]}>
                        {aiConfigured
                          ? `Model: ${config?.model || 'gpt-4o-mini'}`
                          : 'Tap to configure API key'}
                      </Text>
                    </View>
                    <Badge
                      label={aiConfigured ? 'ACTIVE' : 'SETUP'}
                      variant={aiConfigured ? 'status' : 'default'}
                      color={aiConfigured ? '#00FF94' : undefined}
                    />
                  </View>
                </BentoCard>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Config Modal */}
      <Modal visible={showConfigModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText variant="heading">AI Configuration</ThemedText>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <MaterialIcons name="close" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OPENAI API KEY *</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="sk-..."
              placeholderTextColor={theme.textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              secureTextEntry
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>MODEL</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              placeholder="gpt-4o-mini"
              placeholderTextColor={theme.textMuted}
              value={model}
              onChangeText={setModel}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent, opacity: apiKey.trim() && !saving ? 1 : 0.4 }]}
              onPress={handleSaveConfig}
              disabled={!apiKey.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentContrast} />
              ) : (
                <Text style={[styles.saveBtnText, { color: theme.accentContrast }]}>Save Config</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  integRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  integIcon: {
    width: sw(40),
    height: sw(40),
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  integLabel: {
    fontSize: fs(14),
    fontWeight: '700',
  },
  integDesc: {
    fontSize: fs(12),
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: sw(20),
    gap: sw(8),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sw(8),
  },
  inputLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: sw(4),
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: sw(12),
    paddingVertical: sw(10),
    fontSize: fs(14),
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: sw(12),
  },
  saveBtnText: {
    fontSize: fs(13),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
