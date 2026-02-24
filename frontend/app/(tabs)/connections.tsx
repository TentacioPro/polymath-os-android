import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

export default function Connections() {
  const [view, setView] = useState<'timeline' | 'graph' | 'suggestions'>('timeline');
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesRes, connectionsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/activities?limit=50`),
        axios.get(`${BACKEND_URL}/api/connections`)
      ]);
      setActivities(activitiesRes.data);
      setConnections(connectionsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/ai/suggestions`);
      setSuggestions(res.data.suggestions || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateConnectionsForActivity = async (activityId: string) => {
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/api/ai/generate-connections/${activityId}`);
      Alert.alert('Success', 'Connections generated!');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate connections');
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = () => {
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.timeline}>
          {sortedActivities.map((activity, index) => (
            <View key={activity.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < sortedActivities.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineCard}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{activity.title}</Text>
                  {activity.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{activity.category}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.timelineDate}>
                  {new Date(activity.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => generateConnectionsForActivity(activity.id)}
                >
                  <Ionicons name="git-branch" size={16} color="#6366f1" />
                  <Text style={styles.connectButtonText}>Generate Connections</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderGraph = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Knowledge Graph</Text>
        <Text style={styles.graphSubtitle}>{connections.length} connections found</Text>
        
        {connections.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-network-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>No connections yet</Text>
            <Text style={styles.emptySubtext}>Generate connections from timeline view</Text>
          </View>
        ) : (
          <View style={styles.connectionsList}>
            {connections.map((conn: any) => {
              const fromActivity = activities.find(a => a.id === conn.from_id);
              const toActivity = activities.find(a => a.id === conn.to_id);
              
              if (!fromActivity || !toActivity) return null;
              
              return (
                <View key={conn.id} style={styles.connectionCard}>
                  <View style={styles.connectionNode}>
                    <Ionicons name="ellipse" size={12} color="#6366f1" />
                    <Text style={styles.nodeTitle} numberOfLines={1}>
                      {fromActivity.title}
                    </Text>
                  </View>
                  
                  <View style={styles.connectionLine}>
                    <Ionicons name="arrow-down" size={20} color="#94a3b8" />
                    <Text style={styles.connectionType}>{conn.connection_type}</Text>
                  </View>
                  
                  <View style={styles.connectionNode}>
                    <Ionicons name="ellipse" size={12} color="#10b981" />
                    <Text style={styles.nodeTitle} numberOfLines={1}>
                      {toActivity.title}
                    </Text>
                  </View>
                  
                  <Text style={styles.reasoning}>{conn.ai_reasoning}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderSuggestions = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>AI Learning Suggestions</Text>
        <Text style={styles.sectionSubtitle}>Personalized recommendations based on your learning history</Text>
        
        <TouchableOpacity style={styles.generateButton} onPress={loadSuggestions} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Suggestions</Text>
            </>
          )}
        </TouchableOpacity>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion: any, index: number) => (
              <View key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>P{suggestion.priority || 3}</Text>
                  </View>
                  <Ionicons name="bulb" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.suggestionTitle}>{suggestion.suggestion}</Text>
                <Text style={styles.suggestionReasoning}>{suggestion.reasoning}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dots to Connect</Text>
      </View>

      {/* View Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, view === 'timeline' && styles.activeTab]}
          onPress={() => setView('timeline')}
        >
          <Ionicons
            name="time"
            size={20}
            color={view === 'timeline' ? '#6366f1' : '#64748b'}
          />
          <Text style={[styles.tabText, view === 'timeline' && styles.activeTabText]}>
            Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, view === 'graph' && styles.activeTab]}
          onPress={() => setView('graph')}
        >
          <Ionicons
            name="git-network"
            size={20}
            color={view === 'graph' ? '#6366f1' : '#64748b'}
          />
          <Text style={[styles.tabText, view === 'graph' && styles.activeTabText]}>
            Graph
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, view === 'suggestions' && styles.activeTab]}
          onPress={() => setView('suggestions')}
        >
          <Ionicons
            name="sparkles"
            size={20}
            color={view === 'suggestions' ? '#6366f1' : '#64748b'}
          />
          <Text style={[styles.tabText, view === 'suggestions' && styles.activeTabText]}>
            Suggestions
          </Text>
        </TouchableOpacity>
      </View>

      {loading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {view === 'timeline' && renderTimeline()}
          {view === 'graph' && renderGraph()}
          {view === 'suggestions' && renderSuggestions()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#334155',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#6366f1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  timeline: {
    padding: 16,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 24,
    paddingLeft: 32,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 20,
    width: 1,
    height: '100%',
    backgroundColor: '#334155',
  },
  timelineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  connectButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  graphContainer: {
    padding: 16,
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  connectionsList: {
    gap: 16,
  },
  connectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  connectionNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    flex: 1,
  },
  connectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 20,
  },
  connectionType: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  reasoning: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    lineHeight: 20,
  },
  suggestionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsList: {
    gap: 16,
  },
  suggestionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  suggestionReasoning: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
