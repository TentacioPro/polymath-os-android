import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useTheme, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection, hapticMedium } from '../../utils/haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MeshNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'root' | 'primary' | 'secondary' | 'pending';
}

interface MeshEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

export default function NeuralMesh() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { connections, setConnections, activities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  // Graph dimensions
  const graphWidth = SCREEN_WIDTH - spacing.lg * 2;
  const graphHeight = 260;

  useEffect(() => { loadConnections(); }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/connections`);
      setConnections(res.data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    hapticLight();
    setRefreshing(true);
    loadConnections();
  }, []);

  const handleGenerateAll = async () => {
    if (activities.length === 0) {
      hapticWarning();
      Alert.alert('No Data', 'Add knowledge sources first to generate connections.');
      return;
    }
    hapticMedium();
    setGenerating(true);
    try {
      let generated = 0;
      for (const activity of activities.slice(0, 5)) {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/ai/generate-connections/${activity.id}`);
          generated += (res.data?.length || 0);
        } catch (_) { /* skip failures */ }
      }
      hapticSuccess();
      Alert.alert('Done', `Generated ${generated} new connections.`);
      loadConnections();
    } catch (e) {
      hapticWarning();
      Alert.alert('Error', 'Failed to generate connections');
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadSuggestions = async () => {
    hapticPress();
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/suggestions`);
      setSuggestions(res.data?.suggestions || res.data || []);
      hapticSuccess();
    } catch (e) {
      hapticWarning();
      console.error('Failed to load suggestions:', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Graph nodes
  const nodes: MeshNode[] = useMemo(() => {
    if (connections.length === 0) {
      return [
        { id: 'root', label: 'Deep Structure', x: graphWidth / 2, y: 35, type: 'root' },
        { id: 'n1', label: 'Ingestion', x: graphWidth * 0.2, y: 110, type: 'primary' },
        { id: 'n2', label: 'Cognitive Pattern', x: graphWidth * 0.8, y: 95, type: 'primary' },
        { id: 'n3', label: 'Semantic Bridge', x: graphWidth * 0.35, y: 185, type: 'pending' },
        { id: 'n4', label: 'Output Vector', x: graphWidth * 0.7, y: 200, type: 'secondary' },
      ];
    }

    const uniqueMap = new Map<string, string>();
    connections.forEach((c: any) => {
      const k1 = c.from_id || c.from || c.activity_1_title || 'A';
      const k2 = c.to_id || c.to || c.activity_2_title || 'B';
      if (!uniqueMap.has(k1)) uniqueMap.set(k1, c.activity_1_title || c.from || 'Node');
      if (!uniqueMap.has(k2)) uniqueMap.set(k2, c.activity_2_title || c.to || 'Node');
    });

    const entries = Array.from(uniqueMap.entries()).slice(0, 10);
    const cx = graphWidth / 2;
    const cy = graphHeight / 2;
    const radius = Math.min(graphWidth, graphHeight) * 0.35;

    return entries.map(([id, label], i) => {
      const angle = (2 * Math.PI * i) / entries.length - Math.PI / 2;
      const hash = (id.charCodeAt(0) + id.length) % 20 - 10;
      return {
        id,
        label: label.slice(0, 16),
        x: Math.max(55, Math.min(graphWidth - 55, cx + radius * Math.cos(angle) + hash)),
        y: Math.max(20, Math.min(graphHeight - 20, cy + radius * Math.sin(angle) + hash * 0.5)),
        type: (i === 0 ? 'root' : i < 3 ? 'primary' : 'secondary') as MeshNode['type'],
      };
    });
  }, [connections, graphWidth, graphHeight]);

  // Graph edges
  const edges: MeshEdge[] = useMemo(() => {
    if (nodes.length <= 1) return [];
    if (connections.length === 0) {
      return nodes.slice(1).map((n) => ({ from: nodes[0].id, to: n.id }));
    }
    return connections.slice(0, 15).map((c: any) => ({
      from: c.from_id || c.from || c.activity_1_title || '',
      to: c.to_id || c.to || c.activity_2_title || '',
      dashed: (c.strength || 0.5) < 0.3,
    })).filter(e => nodes.some(n => n.id === e.from) && nodes.some(n => n.id === e.to));
  }, [nodes, connections]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); toggleDrawer(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="menu" size={22} color={text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Neural Mesh</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>{connections.length} connections</Text>
        </View>
        <TouchableOpacity
          onPress={() => { hapticPress(); router.push('/analytics' as any); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="insights" size={22} color={text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Graph Card */}
        <View style={[styles.graphCard, { backgroundColor: surface, borderColor: border }]}>
          {loading ? (
            <View style={styles.graphLoading}>
              <ActivityIndicator size="large" color={accent} />
            </View>
          ) : (
            <Svg width={graphWidth - spacing.md * 2} height={graphHeight}>
              {/* Edges */}
              {edges.map((edge, i) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                return (
                  <Line
                    key={`e-${i}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={textMuted}
                    strokeWidth={0.5}
                    strokeDasharray={edge.dashed ? '4,4' : undefined}
                    opacity={0.5}
                  />
                );
              })}
              {/* Nodes */}
              {nodes.map((node) => (
                <React.Fragment key={node.id}>
                  <Rect
                    x={node.x - 45}
                    y={node.y - 11}
                    width={90}
                    height={22}
                    rx={6}
                    fill={node.type === 'root' ? accent : node.type === 'pending' ? 'transparent' : surface}
                    stroke={border}
                    strokeWidth={1}
                    strokeDasharray={node.type === 'pending' ? '3,3' : undefined}
                  />
                  <SvgText
                    x={node.x}
                    y={node.y + 3}
                    fill={node.type === 'root' ? theme.accentContrast : text}
                    fontSize={9}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {node.label}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          )}

          {/* Legend */}
          <View style={[styles.legend, { borderTopColor: border }]}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: accent }]} />
              <Text style={[styles.legendText, { color: textMuted }]}>Root</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: surface, borderWidth: 1, borderColor: border }]} />
              <Text style={[styles.legendText, { color: textMuted }]}>Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 1, borderColor: border }]} />
              <Text style={[styles.legendText, { color: textMuted }]}>Pending</Text>
            </View>
          </View>
        </View>

        {/* AI Actions */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>AI ACTIONS</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: accent, opacity: generating || activities.length === 0 ? 0.5 : 1 },
            ]}
            onPress={handleGenerateAll}
            disabled={generating || activities.length === 0}
          >
            {generating ? (
              <ActivityIndicator size="small" color={theme.accentContrast} />
            ) : (
              <>
                <MaterialIcons name="hub" size={18} color={theme.accentContrast} />
                <Text style={[styles.actionText, { color: theme.accentContrast }]}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: surface, borderColor: border, borderWidth: 1 }]}
            onPress={handleLoadSuggestions}
            disabled={loadingSuggestions}
          >
            {loadingSuggestions ? (
              <ActivityIndicator size="small" color={text} />
            ) : (
              <>
                <MaterialIcons name="lightbulb" size={18} color={text} />
                <Text style={[styles.actionText, { color: text }]}>AI Suggestions</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: textMuted }]}>SUGGESTIONS</Text>
            {suggestions.slice(0, 4).map((s: any, i: number) => (
              <View key={i} style={[styles.suggestionCard, { backgroundColor: surface, borderColor: border }]}>
                <MaterialIcons name="auto-awesome" size={16} color={accent} />
                <Text style={[styles.suggestionText, { color: text }]}>
                  {typeof s === 'string' ? s : s.suggestion || s.title || JSON.stringify(s)}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Connections List */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>CONNECTIONS</Text>
        {connections.length === 0 && !loading && (
          <View style={[styles.emptyCard, { backgroundColor: surface, borderColor: border }]}>
            <MaterialIcons name="grain" size={36} color={border} />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              No connections yet. Generate from your knowledge sources.
            </Text>
          </View>
        )}
        {connections.slice(0, 8).map((conn: any, i: number) => (
          <TouchableOpacity
            key={conn.id || i}
            style={[styles.connCard, { backgroundColor: surface, borderColor: border }]}
            onPress={() => { hapticSelection(); }}
            activeOpacity={0.7}
          >
            <View style={styles.connContent}>
              <Text style={[styles.connFrom, { color: text }]} numberOfLines={1}>
                {conn.activity_1_title || conn.from || 'Source'}
              </Text>
              <View style={styles.connArrow}>
                <MaterialIcons name="arrow-forward" size={12} color={textMuted} />
                <Text style={[styles.connTo, { color: textMuted }]} numberOfLines={1}>
                  {conn.activity_2_title || conn.to || 'Target'}
                </Text>
              </View>
            </View>
            <View style={[styles.connBadge, { backgroundColor: accent + '20' }]}>
              <Text style={[styles.connBadgeText, { color: accent }]}>
                {conn.connection_type || 'LINK'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
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

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },

  /* Graph Card */
  graphCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  graphLoading: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: fs(9),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Section */
  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: sw(48),
    borderRadius: 12,
  },
  actionText: { fontSize: fs(13), fontWeight: '600' },

  /* Suggestions */
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  suggestionText: { flex: 1, fontSize: fs(13), lineHeight: 19 },

  /* Empty */
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: { fontSize: fs(13), textAlign: 'center', marginTop: spacing.md },

  /* Connections */
  connCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  connContent: { flex: 1 },
  connFrom: { fontSize: fs(14), fontWeight: '600', marginBottom: 4 },
  connArrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  connTo: { fontSize: fs(12), flex: 1 },
  connBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  connBadgeText: { fontSize: fs(9), fontWeight: '600', letterSpacing: 0.5 },
});
