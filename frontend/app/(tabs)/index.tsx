import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useStore } from '../../store/useStore';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { activities, journals, setActivities, setJournals } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, journalsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/stats`),
        axios.get(`${BACKEND_URL}/api/activities?limit=10`),
        axios.get(`${BACKEND_URL}/api/journals?limit=5`)
      ]);
      
      setStats(statsRes.data);
      setActivities(activitiesRes.data);
      setJournals(journalsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your polymath journey...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Polymath OS</Text>
        <Text style={styles.subtitle}>Track, Learn, Connect</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={32} color="#6366f1" />
          <Text style={styles.statNumber}>{stats?.total_activities || 0}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="book" size={32} color="#10b981" />
          <Text style={styles.statNumber}>{stats?.total_journals || 0}</Text>
          <Text style={styles.statLabel}>Journals</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="git-network" size={32} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats?.total_connections || 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
      </View>

      {/* Category Distribution */}
      {stats?.categories && Object.keys(stats.categories).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Categories</Text>
          <View style={styles.categoriesContainer}>
            {Object.entries(stats.categories).map(([category, count]: [string, any]) => (
              <View key={category} style={styles.categoryChip}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Learning</Text>
          {activities.slice(0, 5).map((activity: any) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle} numberOfLines={2}>{activity.title}</Text>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(activity.category) }]}>
                  <Text style={styles.categoryTagText}>{activity.category || 'Other'}</Text>
                </View>
              </View>
              <Text style={styles.activityMeta}>
                {new Date(activity.timestamp).toLocaleDateString()} • {activity.source}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={loadData}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'AI': '#8b5cf6',
    'News': '#3b82f6',
    'Tools': '#10b981',
    'Market': '#f59e0b',
    'Research': '#ec4899',
    'Tutorial': '#06b6d4',
    'Other': '#6b7280'
  };
  return colors[category] || colors['Other'];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#e2e8f0',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryName: {
    color: '#e2e8f0',
    fontSize: 14,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  categoryCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activityMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
