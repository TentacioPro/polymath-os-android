import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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

export default function AlertsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const styles = useStyles();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications?limit=20`);
      setAlerts(res.data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return '#00FF94';
      case 'warning': return '#FFB800';
      default: return theme.accent;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffM = Math.floor(diffMs / 60000);
      if (diffM < 1) return 'Just now';
      if (diffM < 60) return `${diffM}m ago`;
      const diffH = Math.floor(diffM / 60);
      if (diffH < 24) return `${diffH}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

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
              Notifications
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Alerts
            </ThemedText>
          </View>
          <Badge label={`${alerts.length}`} variant="filled" />
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : alerts.length === 0 ? (
          <View style={{ paddingHorizontal: spacing.xl, alignItems: 'center', paddingVertical: 40 }}>
            <MaterialIcons name="notifications-none" size={48} color={theme.textMuted} />
            <ThemedText variant="body" color="muted" style={{ marginTop: 12 }}>
              No notifications yet. Activity will appear here.
            </ThemedText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing.xl }}>
            <SectionHeader label="Recent" icon="notifications" />
            {alerts.map((alert: any, i: number) => (
              <BentoCard key={alert.id || i} padding="md" style={{ marginBottom: spacing.sm }}>
                <View style={styles.alertRow}>
                  <MaterialIcons
                    name={getAlertIcon(alert.type) as any}
                    size={20}
                    color={getAlertColor(alert.type)}
                  />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>{alert.title}</Text>
                    <Text style={[styles.alertDesc, { color: theme.textSecondary }]}>{alert.desc}</Text>
                  </View>
                  <Text style={[styles.alertTime, { color: theme.textMuted }]}>
                    {formatTime(alert.timestamp)}
                  </Text>
                </View>
              </BentoCard>
            ))}
          </View>
        )}

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
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: fs(12),
  },
  alertTime: {
    fontSize: fs(10),
    letterSpacing: 0.5,
  },
}));
