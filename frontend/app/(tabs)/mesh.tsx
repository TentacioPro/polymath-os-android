import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Line, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import axios from 'axios';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import { hapticPress, hapticLight, hapticSuccess, hapticWarning, hapticSelection, hapticMedium } from '../../utils/haptics';
import { getBackendUrlSync } from '../../utils/backend';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';
import M3Progress from '../../components/ui/M3Progress';
import M3Button from '../../components/ui/M3Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { AIProgress } from '../../components/ui/AIProgress';
import { useDialog } from '../../components/ui/DialogProvider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MeshNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  type: 'root' | 'primary' | 'secondary';
}

interface MeshEdge {
  from: string;
  to: string;
  dashed?: boolean;
}

export default function NeuralMesh() {
  const { theme } = useTheme();
  const { connections, setConnections, activities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genCount, setGenCount] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  let dialog: any;
  try { dialog = useDialog(); } catch { dialog = null; }

  const graphWidth = SCREEN_WIDTH;
  const graphHeight = SCREEN_HEIGHT * 0.45;

  useEffect(() => { loadConnections(); }, []);

  const loadConnections = async () => {
    const BACKEND_URL = getBackendUrlSync();
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
    const BACKEND_URL = getBackendUrlSync();
    if (activities.length === 0) {
      hapticWarning();
      if (dialog) dialog.showAlert('No Data', 'Add knowledge sources first to generate connections.');
      return;
    }
    hapticMedium();
    setGenerating(true);
    setGenStep(0);
    setGenCount(0);
    try {
      let generated = 0;
      const steps = Math.min(activities.length, 5);
      for (let i = 0; i < steps; i++) {
        setGenStep(Math.min(i, 2));
        try {
          const res = await axios.post(`${BACKEND_URL}/api/ai/generate-connections/${activities[i].id}`);
          generated += (res.data?.length || 0);
        } catch { /* skip */ }
      }
      setGenCount(generated);
      hapticSuccess();
      loadConnections();
    } catch {
      hapticWarning();
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadSuggestions = async () => {
    const BACKEND_URL = getBackendUrlSync();
    hapticPress();
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/suggestions`);
      setSuggestions(res.data?.suggestions || res.data || []);
      hapticSuccess();
    } catch {
      hapticWarning();
    }
  };

  // Graph nodes - circles instead of rectangles, M3 style
  const nodes: MeshNode[] = useMemo(() => {
    if (connections.length === 0) {
      return [
        { id: 'root', label: 'Mesh', x: graphWidth / 2, y: graphHeight * 0.35, size: 36, type: 'root' },
        { id: 'n1', label: 'Ingestion', x: graphWidth * 0.2, y: graphHeight * 0.55, size: 28, type: 'primary' },
        { id: 'n2', label: 'Patterns', x: graphWidth * 0.8, y: graphHeight * 0.45, size: 28, type: 'primary' },
        { id: 'n3', label: 'Bridge', x: graphWidth * 0.35, y: graphHeight * 0.75, size: 24, type: 'secondary' },
        { id: 'n4', label: 'Output', x: graphWidth * 0.7, y: graphHeight * 0.8, size: 24, type: 'secondary' },
      ];
    }
    const uniqueMap = new Map<string, { label: string; count: number }>();
    connections.forEach((c: any) => {
      const k1 = c.from_id || c.from || c.activity_1_title || 'A';
      const k2 = c.to_id || c.to || c.activity_2_title || 'B';
      const l1 = c.activity_1_title || c.from || 'Node';
      const l2 = c.activity_2_title || c.to || 'Node';
      const e1 = uniqueMap.get(k1) || { label: l1, count: 0 };
      const e2 = uniqueMap.get(k2) || { label: l2, count: 0 };
      uniqueMap.set(k1, { label: e1.label, count: e1.count + 1 });
      uniqueMap.set(k2, { label: e2.label, count: e2.count + 1 });
    });
    const entries = Array.from(uniqueMap.entries()).slice(0, 10);
    const cx = graphWidth / 2;
    const cy = graphHeight / 2;
    const radius = Math.min(graphWidth, graphHeight) * 0.35;
    return entries.map(([id, data], i) => {
      const angle = (2 * Math.PI * i) / entries.length - Math.PI / 2;
      const sz = Math.min(56, Math.max(24, 20 + data.count * 4));
      return {
        id,
        label: data.label.slice(0, 14),
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        size: sz,
        type: (i === 0 ? 'root' : i < 3 ? 'primary' : 'secondary') as MeshNode['type'],
      };
    });
  }, [connections, graphWidth, graphHeight]);

  const edges: MeshEdge[] = useMemo(() => {
    if (nodes.length <= 1) return [];
    if (connections.length === 0) return nodes.slice(1).map((n) => ({ from: nodes[0].id, to: n.id }));
    return connections.slice(0, 15).map((c: any) => ({
      from: c.from_id || c.from || c.activity_1_title || '',
      to: c.to_id || c.to || c.activity_2_title || '',
      dashed: (c.strength || 0.5) < 0.3,
    })).filter(e => nodes.some(n => n.id === e.from) && nodes.some(n => n.id === e.to));
  }, [nodes, connections]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Full-bleed Graph */}
        <View style={[styles.graphArea, { height: graphHeight }]}>
          {loading ? (
            <View style={styles.graphLoading}>
              <M3Progress variant="circular" size="large" />
            </View>
          ) : (
            <Svg width={graphWidth} height={graphHeight}>
              {edges.map((edge, i) => {
                const from = nodes.find((n) => n.id === edge.from);
                const to = nodes.find((n) => n.id === edge.to);
                if (!from || !to) return null;
                return (
                  <Line
                    key={`e-${i}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke={theme.outlineVariant}
                    strokeWidth={1}
                    strokeDasharray={edge.dashed ? '4,4' : undefined}
                    opacity={0.6}
                  />
                );
              })}
              {nodes.map((node) => (
                <React.Fragment key={node.id}>
                  <SvgCircle
                    cx={node.x} cy={node.y}
                    r={node.size / 2}
                    fill={node.type === 'root' ? theme.primary : theme.surfaceContainerHigh}
                  />
                  <SvgText
                    x={node.x} y={node.y + 3}
                    fill={node.type === 'root' ? theme.onPrimary : theme.onSurface}
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

          {/* Floating controls */}
          <View style={[styles.floatingControls]}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: theme.surfaceContainerHigh }]}
              onPress={handleGenerateAll}
              disabled={generating}
            >
              <Ionicons name="sparkles-outline" size={20} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: theme.surfaceContainerHigh }]}
              onPress={handleLoadSuggestions}
            >
              <Ionicons name="bulb-outline" size={20} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={[styles.legendPill, { backgroundColor: theme.surfaceContainer }]}>
              <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.legendText, { color: theme.onSurfaceVariant }]}>Root</Text>
            </View>
            <View style={[styles.legendPill, { backgroundColor: theme.surfaceContainer }]}>
              <View style={[styles.legendDot, { backgroundColor: theme.surfaceContainerHigh }]} />
              <Text style={[styles.legendText, { color: theme.onSurfaceVariant }]}>Node</Text>
            </View>
          </View>
        </View>

        {/* AI Generation progress */}
        {generating && (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <AIProgress state="processing" currentStep={genStep} />
          </View>
        )}
        {!generating && genCount > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
            <AIProgress state="result" resultCount={genCount} onView={() => {}} />
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Text style={[styles.sectionLabel, { color: theme.onSurfaceVariant }]}>SUGGESTIONS</Text>
            {suggestions.slice(0, 4).map((s: any, i: number) => (
              <View key={i} style={[styles.suggestionCard, { backgroundColor: theme.surfaceContainer }]}>
                <Ionicons name="sparkles" size={16} color={theme.primary} />
                <Text style={[styles.suggestionText, { color: theme.onSurface }]}>
                  {typeof s === 'string' ? s : s.suggestion || s.title || JSON.stringify(s)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Connections List */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text style={[styles.sectionLabel, { color: theme.onSurfaceVariant }]}>
            CONNECTIONS ({connections.length})
          </Text>
          {connections.length === 0 && !loading && (
            <EmptyState variant="empty-connections" onCTA={handleGenerateAll} />
          )}
          {connections.slice(0, 10).map((conn: any, i: number) => (
            <TouchableOpacity
              key={conn.id || i}
              style={[styles.connCard, { backgroundColor: theme.surfaceContainer }]}
              onPress={() => hapticSelection()}
              activeOpacity={0.7}
            >
              <View style={styles.connContent}>
                <Text style={[styles.connFrom, { color: theme.onSurface }]} numberOfLines={1}>
                  {conn.activity_1_title || conn.from || 'Source'}
                </Text>
                <View style={styles.connArrow}>
                  <Ionicons name="arrow-forward" size={12} color={theme.onSurfaceVariant} />
                  <Text style={[styles.connTo, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                    {conn.activity_2_title || conn.to || 'Target'}
                  </Text>
                </View>
              </View>
              <View style={[styles.connBadge, { backgroundColor: theme.primaryContainer }]}>
                <Text style={[styles.connBadgeText, { color: theme.onPrimaryContainer }]}>
                  {conn.connection_type || 'LINK'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },

  /* Graph */
  graphArea: { position: 'relative' },
  graphLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floatingControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  legendRow: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: m3Typography.labelSmall.fontSize },

  /* Section */
  sectionLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  /* Suggestions */
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
  },
  suggestionText: { flex: 1, fontSize: m3Typography.bodyMedium.fontSize, lineHeight: 22 },

  /* Connections */
  connCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
  },
  connContent: { flex: 1 },
  connFrom: { fontSize: m3Typography.titleSmall.fontSize, fontWeight: '600', marginBottom: 4 },
  connArrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  connTo: { fontSize: m3Typography.bodySmall.fontSize, flex: 1 },
  connBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: m3Radii.full },
  connBadgeText: { fontSize: m3Typography.labelSmall.fontSize, fontWeight: '600' },
});
