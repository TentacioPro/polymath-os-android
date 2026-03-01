import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../theme';
import { hapticLight, hapticSelection } from '../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function AlertsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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

  useEffect(() => { fetchAlerts(); }, []);

  const onRefresh = useCallback(() => {
    hapticLight();
    setRefreshing(true);
    fetchAlerts();
  }, []);

  const getAlertIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
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
      default: return accent;
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

  const renderAlert = ({ item }: { item: any }) => {
    const color = getAlertColor(item.type);
    return (
      <TouchableOpacity
        style={[styles.alertCard, { backgroundColor: surface, borderColor: border }]}
        onPress={() => hapticSelection()}
        activeOpacity={0.7}
      >
        <View style={[styles.alertIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={getAlertIcon(item.type)} size={18} color={color} />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color: text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.alertDesc, { color: textMuted }]} numberOfLines={2}>
            {item.desc}
          </Text>
        </View>
        <Text style={[styles.alertTime, { color: textMuted }]}>
          {formatTime(item.timestamp)}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.title, { color: text }]}>Alerts</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {alerts.length} notification{alerts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={alerts}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="notifications-none" size={48} color={border} />
            <Text style={[styles.emptyTitle, { color: textMuted }]}>No notifications</Text>
            <Text style={[styles.emptyHint, { color: textMuted }]}>
              Activity will appear here
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 80 }} />}
        showsVerticalScrollIndicator={false}
      />
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

  /* List */
  listContent: { paddingHorizontal: spacing.lg },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  alertIcon: {
    width: sw(40),
    height: sw(40),
    borderRadius: sw(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: fs(14), fontWeight: '600' },
  alertDesc: { fontSize: fs(12), marginTop: 2, lineHeight: 17 },
  alertTime: { fontSize: fs(10) },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl },
  emptyTitle: { fontSize: fs(16), fontWeight: '600', marginTop: spacing.md },
  emptyHint: { fontSize: fs(13), marginTop: spacing.xs },
});
