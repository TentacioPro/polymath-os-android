import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import axios from 'axios';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii } from '../../shared/design-tokens';
import M3Progress from '../components/ui/M3Progress';
import { EmptyState } from '../components/ui/EmptyState';
import { hapticLight, hapticSelection } from '../utils/haptics';
import { getBackendUrlSync } from '../utils/backend';

export default function AlertsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    const BACKEND_URL = getBackendUrlSync();
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
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      default: return theme.info;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'success': return theme.successContainer;
      case 'warning': return theme.warningContainer;
      default: return theme.infoContainer;
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
    } catch { return ''; }
  };

  const renderAlert = ({ item, index }: { item: any; index: number }) => {
    const color = getAlertColor(item.type);
    const bg = getAlertBg(item.type);
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity
          style={[styles.alertCard, { backgroundColor: theme.surfaceContainer }]}
          onPress={() => hapticSelection()}
          activeOpacity={0.7}
        >
          {/* Color strip */}
          <View style={[styles.alertStrip, { backgroundColor: color }]} />
          <View style={[styles.alertIcon, { backgroundColor: bg }]}>
            <MaterialIcons name={getAlertIcon(item.type)} size={18} color={color} />
          </View>
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: theme.onSurface }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.alertDesc, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
              {item.desc}
            </Text>
          </View>
          <Text style={[styles.alertTime, { color: theme.onSurfaceVariant }]}>
            {formatTime(item.timestamp)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Alerts</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>
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
        ListEmptyComponent={
          <EmptyState
            variant="empty-alerts"
            title="No notifications"
            description="Activity will appear here"
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
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

  /* List */
  listContent: { paddingHorizontal: spacing.lg },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  alertStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: m3Radii.xl,
    borderBottomLeftRadius: m3Radii.xl,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: { flex: 1 },
  alertTitle: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '600',
  },
  alertDesc: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
    lineHeight: m3Typography.bodySmall.lineHeight,
  },
  alertTime: {
    fontSize: m3Typography.labelSmall.fontSize,
  },
});
