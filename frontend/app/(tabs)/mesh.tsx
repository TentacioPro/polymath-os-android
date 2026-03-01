import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import axios from 'axios';
import SafeView from '../../components/shared/SafeView';
import BentoCard from '../../components/ui/BentoCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Badge from '../../components/ui/Badge';
import ArchitectButton from '../../components/ui/ArchitectButton';
import ThemedText from '../../components/shared/ThemedText';
import { useTheme, createThemedStyles, spacing, fs, sw } from '../../theme';
import { useStore } from '../../store/useStore';

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
  const toggleDrawer = useStore((s) => s.toggleDrawer);
  const { connections, setConnections } = useStore();
  const { activities } = useStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const styles = useStyles();

  // Generate mesh nodes from connections data
  const graphWidth = SCREEN_WIDTH - spacing.xl * 2;
  const graphHeight = 280;

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/connections`);
      setConnections(res.data);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    if (activities.length === 0) {
      Alert.alert('No Activities', 'Add some knowledge sources first to generate connections.');
      return;
    }
    setGenerating(true);
    try {
      let generated = 0;
      for (const activity of activities.slice(0, 5)) {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/ai/generate-connections/${activity.id}`);
          generated += (res.data?.length || 0);
        } catch (_) { /* skip individual failures */ }
      }
      Alert.alert('Done', `Generated ${generated} new connections.`);
      loadConnections();
    } catch (e) {
      Alert.alert('Error', 'Failed to generate connections');
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/suggestions`);
      setSuggestions(res.data?.suggestions || res.data || []);
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Create graph nodes from connections
  const nodes: MeshNode[] = React.useMemo(() => {
    if (connections.length === 0) {
      return [
        { id: 'root', label: 'Deep Structure', x: graphWidth / 2, y: 40, type: 'root' },
        { id: 'n1', label: 'Ingestion', x: graphWidth * 0.2, y: 120, type: 'primary' },
        { id: 'n2', label: 'Cognitive Pattern', x: graphWidth * 0.8, y: 100, type: 'primary' },
        { id: 'n3', label: 'Semantic Bridge', x: graphWidth * 0.35, y: 200, type: 'pending' },
        { id: 'n4', label: 'Output Vector', x: graphWidth * 0.7, y: 220, type: 'secondary' },
      ];
    }

    const uniqueLabels = new Set<string>();
    connections.forEach((c: any) => {
      uniqueLabels.add(c.activity_1_title || c.from || 'Node');
      uniqueLabels.add(c.activity_2_title || c.to || 'Node');
    });

    const labels = Array.from(uniqueLabels).slice(0, 8);
    return labels.map((label, i) => ({
      id: `n${i}`,
      label: label.slice(0, 20),
      x: graphWidth * (0.15 + 0.7 * Math.random()),
      y: 30 + (graphHeight - 60) * Math.random(),
      type: (i === 0 ? 'root' : i < 3 ? 'primary' : 'secondary') as MeshNode['type'],
    }));
  }, [connections, graphWidth, graphHeight]);

  const edges: MeshEdge[] = React.useMemo(() => {
    if (nodes.length <= 1) return [];
    const result: MeshEdge[] = [];
    for (let i = 1; i < nodes.length; i++) {
      result.push({
        from: nodes[Math.max(0, i - 1 - Math.floor(Math.random() * 2))].id,
        to: nodes[i].id,
        dashed: nodes[i].type === 'pending',
      });
    }
    return result;
  }, [nodes]);

  return (
    <SafeView>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
            <MaterialIcons name="menu" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.systemLabel, { color: theme.textSecondary }]}>
              Neural Mesh
            </Text>
            <ThemedText variant="display" style={{ fontSize: 24 }}>
              Knowledge Graph
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <MaterialIcons name="tune" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Graph visualization */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <BentoCard padding="none" shadow>
            <View
              style={[
                styles.graphContainer,
                { borderBottomColor: theme.border },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="large" color={theme.accent} />
              ) : (
                <Svg width={graphWidth} height={graphHeight}>
                  {/* Edges */}
                  {edges.map((edge, i) => {
                    const fromNode = nodes.find((n) => n.id === edge.from);
                    const toNode = nodes.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <Line
                        key={`edge-${i}`}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={theme.textPrimary}
                        strokeWidth={0.5}
                        strokeDasharray={edge.dashed ? '4,4' : undefined}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {nodes.map((node) => (
                    <React.Fragment key={node.id}>
                      <Rect
                        x={node.x - 50}
                        y={node.y - 12}
                        width={100}
                        height={24}
                        fill={
                          node.type === 'root'
                            ? theme.accent
                            : node.type === 'pending'
                              ? 'transparent'
                              : theme.surface
                        }
                        stroke={theme.border}
                        strokeWidth={1}
                        strokeDasharray={node.type === 'pending' ? '3,3' : undefined}
                      />
                      <SvgText
                        x={node.x}
                        y={node.y + 4}
                        fill={node.type === 'root' ? theme.accentContrast : theme.textPrimary}
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
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Root</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
                  ]}
                />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Active</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: theme.border,
                    },
                  ]}
                />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>Pending</Text>
              </View>
            </View>
          </BentoCard>
        </View>

        {/* AI Actions */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="AI Actions" icon="auto-awesome" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <ArchitectButton
                label={generating ? 'Generating...' : 'Generate Connections'}
                icon={<MaterialIcons name="hub" size={16} color={theme.accentContrast} />}
                onPress={handleGenerateAll}
                disabled={generating || activities.length === 0}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ArchitectButton
                label={loadingSuggestions ? 'Loading...' : 'AI Suggestions'}
                icon={<MaterialIcons name="lightbulb" size={16} color={theme.accentContrast} />}
                onPress={handleLoadSuggestions}
                disabled={loadingSuggestions}
              />
            </View>
          </View>

          {suggestions.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              {suggestions.slice(0, 4).map((s: any, i: number) => (
                <BentoCard key={i} padding="md" style={{ marginBottom: spacing.sm }}>
                  <ThemedText variant="body">
                    {typeof s === 'string' ? s : s.suggestion || s.title || JSON.stringify(s)}
                  </ThemedText>
                </BentoCard>
              ))}
            </View>
          )}
        </View>

        {/* Connections list */}
        <View style={{ paddingHorizontal: spacing.xl }}>
          <SectionHeader label="Connections" icon="hub" />
          {connections.length === 0 && !loading && (
            <BentoCard padding="lg">
              <View style={styles.emptyState}>
                <MaterialIcons name="grain" size={40} color={theme.textMuted} />
                <ThemedText
                  variant="body"
                  color="muted"
                  style={{ marginTop: 12, textAlign: 'center' }}
                >
                  No connections yet. Generate connections from your activities.
                </ThemedText>
              </View>
            </BentoCard>
          )}
          {connections.slice(0, 6).map((conn: any, i: number) => (
            <BentoCard key={conn.id || i} padding="md" style={{ marginBottom: spacing.sm }}>
              <View style={styles.connRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.connTitle, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {conn.activity_1_title || conn.from || 'Source'}
                  </Text>
                  <View style={styles.connArrow}>
                    <MaterialIcons name="arrow-forward" size={12} color={theme.textSecondary} />
                    <Text
                      style={[styles.connTarget, { color: theme.textSecondary }]}
                      numberOfLines={1}
                    >
                      {conn.activity_2_title || conn.to || 'Target'}
                    </Text>
                  </View>
                </View>
                <Badge label={conn.connection_type || 'LINK'} />
              </View>
              {conn.reasoning && (
                <Text
                  style={[styles.connReasoning, { color: theme.textMuted }]}
                  numberOfLines={2}
                >
                  {conn.reasoning}
                </Text>
              )}
            </BentoCard>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  scrollContent: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: sw(20),
    paddingVertical: sw(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
  },
  menuBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: sw(12),
  },
  systemLabel: {
    fontSize: fs(10),
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  settingsBtn: {
    padding: 4,
  },
  graphContainer: {
    height: 280,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  connRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  connTitle: {
    fontSize: fs(13),
    fontWeight: '700',
    marginBottom: 4,
  },
  connArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connTarget: {
    fontSize: fs(12),
    flex: 1,
  },
  connReasoning: {
    fontSize: fs(11),
    marginTop: spacing.sm,
    lineHeight: 16,
  },
}));
