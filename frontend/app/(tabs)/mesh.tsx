import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';import Svg, {
  Line,
  Circle as SvgCircle,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import axios from 'axios';
import { useTheme, spacing } from '../../theme';
import { useStore } from '../../store/useStore';
import {
  hapticPress,
  hapticLight,
  hapticSuccess,
  hapticWarning,
  hapticSelection,
  hapticMedium,
} from '../../utils/haptics';
import { getBackendUrlSync } from '../../utils/backend';
import { m3Typography, m3Radii } from '../../../shared/design-tokens';
import { HEADER_MAX } from '../../components/navigation/CollapsibleHeader';
import M3Progress from '../../components/ui/M3Progress';
import { EmptyState } from '../../components/ui/EmptyState';
import { AIProgress } from '../../components/ui/AIProgress';
import { useDialog } from '../../components/ui/DialogProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MeshNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  type: 'root' | 'primary' | 'secondary';
  count: number;
}

interface MeshEdge {
  from: string;
  to: string;
  strength: number;
}

/* ── Pulsing glow ring on the root node ─────────────────────── */
function PulseRing({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.6, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: cx - r * scale.value,
    top: cy - r * scale.value,
    width: r * 2 * scale.value,
    height: r * 2 * scale.value,
    borderRadius: r * scale.value,
    borderWidth: 1.5,
    borderColor: color,
    opacity: opacity.value,
  }));

  return <Animated.View style={animStyle} />;
}

/* ── Animated data particle flowing along an edge ───────────── */
function EdgeParticle({ x1, y1, x2, y2, color, delay = 0 }: { x1: number; y1: number; x2: number; y2: number; color: string; delay?: number }) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3000 + Math.random() * 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: x1 + (x2 - x1) * progress.value - 3,
    top: y1 + (y2 - y1) * progress.value - 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color,
    opacity: withTiming(progress.value > 0.1 && progress.value < 0.9 ? 0.6 : 0, { duration: 200 }),
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }));

  return <Animated.View style={animStyle} />;
}

export default function NeuralMesh() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { connections, setConnections, activities } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [genCount, setGenCount] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  let dialog: any;
  try { dialog = useDialog(); } catch { dialog = null; }

  const graphWidth = SCREEN_WIDTH - 32;
  const graphHeight = Math.min(SCREEN_WIDTH * 0.9, 380);

  /* ── Zoom / Pan state ──────────────────────────────────────── */
  const meshScale = useSharedValue(1);
  const meshTranslateX = useSharedValue(0);
  const meshTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => { savedScale.value = meshScale.value; })
    .onUpdate((e) => {
      meshScale.value = Math.max(0.5, Math.min(3, savedScale.value * e.scale));
    });

  const panGesture = Gesture.Pan()
    .minDistance(10)
    .onStart(() => {
      savedTranslateX.value = meshTranslateX.value;
      savedTranslateY.value = meshTranslateY.value;
    })
    .onUpdate((e) => {
      meshTranslateX.value = savedTranslateX.value + e.translationX;
      meshTranslateY.value = savedTranslateY.value + e.translationY;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      meshScale.value = withSpring(1);
      meshTranslateX.value = withSpring(0);
      meshTranslateY.value = withSpring(0);
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  const meshAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: meshTranslateX.value },
      { translateY: meshTranslateY.value },
      { scale: meshScale.value },
    ],
  }));

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

  /* ── Build graph layout ─────────────────────────────────────── */
  // Activity lookup for resolving node labels from IDs
  const activityMap = useMemo(() => {
    const map = new Map<string, any>();
    activities.forEach((a: any) => map.set(a.id, a));
    return map;
  }, [activities]);

  const extractDomain = (url?: string): string | null => {
    if (!url) return null;
    try { return new URL(url).hostname.replace('www.', ''); } catch { return null; }
  };

  const resolveLabel = (id: string, fallback: string): string => {
    const act = activityMap.get(id);
    if (act?.title) return act.title;
    if (act?.url) {
      const domain = extractDomain(act.url);
      if (domain) return domain;
    }
    return fallback || 'Unknown';
  };

  const nodes: MeshNode[] = useMemo(() => {
    if (connections.length === 0) {
      return []; // No placeholder nodes — show EmptyState instead
    }

    const uniqueMap = new Map<string, { label: string; count: number }>();
    connections.forEach((c: any) => {
      const k1 = c.from_id || c.from || c.activity_1_title || 'A';
      const k2 = c.to_id || c.to || c.activity_2_title || 'B';
      const l1 = c.activity_1_title || resolveLabel(k1, c.from || '');
      const l2 = c.activity_2_title || resolveLabel(k2, c.to || '');
      const e1 = uniqueMap.get(k1) || { label: l1, count: 0 };
      const e2 = uniqueMap.get(k2) || { label: l2, count: 0 };
      uniqueMap.set(k1, { label: e1.label, count: e1.count + 1 });
      uniqueMap.set(k2, { label: e2.label, count: e2.count + 1 });
    });

    const entries = Array.from(uniqueMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12);

    const cx = graphWidth / 2;
    const cy = graphHeight / 2;

    // Place highest-count node at center, rest in concentric rings
    return entries.map(([id, data], i) => {
      if (i === 0) {
        return {
          id,
          label: data.label.length > 12 ? data.label.slice(0, 11) + '...' : data.label,
          x: cx,
          y: cy,
          size: Math.min(52, 32 + data.count * 3),
          type: 'root' as const,
          count: data.count,
        };
      }

      // Organic spiral-ish layout with jitter
      const ring = i <= 5 ? 1 : 2;
      const baseRadius = ring === 1
        ? Math.min(graphWidth, graphHeight) * 0.28
        : Math.min(graphWidth, graphHeight) * 0.42;
      const countInRing = ring === 1 ? Math.min(entries.length - 1, 5) : entries.length - 6;
      const indexInRing = ring === 1 ? i - 1 : i - 6;
      const angle = (2 * Math.PI * indexInRing) / countInRing - Math.PI / 2;
      // Slight radial jitter for organic feel
      const jitter = ((id.charCodeAt(0) % 7) - 3) * 8;

      return {
        id,
        label: data.label.length > 12 ? data.label.slice(0, 11) + '...' : data.label,
        x: cx + (baseRadius + jitter) * Math.cos(angle),
        y: cy + (baseRadius + jitter) * Math.sin(angle),
        size: Math.min(44, Math.max(24, 20 + data.count * 3)),
        type: (ring === 1 ? 'primary' : 'secondary') as MeshNode['type'],
        count: data.count,
      };
    });
  }, [connections, graphWidth, graphHeight]);

  const edges: MeshEdge[] = useMemo(() => {
    if (nodes.length <= 1) return [];
    if (connections.length === 0) {
      return nodes.slice(1).map((n) => ({ from: nodes[0].id, to: n.id, strength: 0.5 }));
    }
    return connections.slice(0, 20).map((c: any) => ({
      from: c.from_id || c.from || c.activity_1_title || '',
      to: c.to_id || c.to || c.activity_2_title || '',
      strength: c.strength || 0.5,
    })).filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
  }, [nodes, connections]);

  /* ── Stats ──────────────────────────────────────────────────── */
  const uniqueNodes = new Set<string>();
  connections.forEach((c: any) => {
    uniqueNodes.add(c.from_id || c.from || c.activity_1_title || '');
    uniqueNodes.add(c.to_id || c.to || c.activity_2_title || '');
  });
  const stats = [
    { label: 'Connections', value: connections.length, icon: 'git-network-outline' as const },
    { label: 'Nodes', value: uniqueNodes.size, icon: 'ellipse-outline' as const },
    { label: 'Sources', value: activities.length, icon: 'layers-outline' as const },
  ];

  /* ── Node fill color by type ────────────────────────────────── */
  const nodeFill = (type: MeshNode['type']) => {
    switch (type) {
      case 'root': return theme.primary;
      case 'primary': return theme.secondary || theme.primaryContainer;
      case 'secondary': return theme.tertiary || theme.surfaceContainerHigh;
    }
  };

  const nodeTextColor = (type: MeshNode['type']) => {
    switch (type) {
      case 'root': return theme.onPrimary;
      case 'primary': return theme.onSecondary || theme.onPrimaryContainer;
      case 'secondary': return theme.onTertiary || theme.onSurface;
    }
  };

  const handleNodePress = (id: string) => {
    hapticSelection();
    setSelectedNode(selectedNode === id ? null : id);
  };

  /* ── Connection type colors ─────────────────────────────────── */
  const connTypeColor = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('thematic') || t.includes('theme')) return theme.secondary || theme.primary;
    if (t.includes('causal') || t.includes('cause')) return theme.tertiary || theme.primary;
    if (t.includes('temporal') || t.includes('time')) return theme.primary;
    return theme.primaryContainer;
  };

  const connTypeTextColor = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('thematic') || t.includes('theme')) return theme.onSecondary || theme.onPrimary;
    if (t.includes('causal') || t.includes('cause')) return theme.onTertiary || theme.onPrimary;
    if (t.includes('temporal') || t.includes('time')) return theme.onPrimary;
    return theme.onPrimaryContainer;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* ── Stats Row ───────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.statsRow}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, styles.shadowLight, { backgroundColor: theme.surfaceContainer }]}
            >
              <Ionicons name={s.icon} size={18} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.onSurface }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: theme.onSurfaceVariant }]}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Graph Card ──────────────────────────────────────── */}
        <Animated.View
          entering={FadeIn.delay(100)}
          style={[
            styles.graphCard,
            styles.shadowMedium,
            {
              backgroundColor: theme.surfaceContainer,
              borderColor: 'rgba(150, 150, 150, 0.05)',
            },
          ]}
        >
          {loading ? (
            <View style={[styles.graphLoading, { height: graphHeight }]}>
              <M3Progress variant="circular" size="large" />
              <Text style={[styles.loadingText, { color: theme.onSurfaceVariant }]}>
                Mapping connections...
              </Text>
            </View>
          ) : nodes.length === 0 ? (
            <View style={{ paddingVertical: spacing.xl }}>
              <EmptyState variant="empty-connections" onCTA={handleGenerateAll} />
            </View>
          ) : (
            <GestureDetector gesture={composedGesture}>
            <Animated.View style={[{ height: graphHeight, position: 'relative', overflow: 'hidden' }, meshAnimStyle]}>
              {/* Pulse ring on root node */}
              {nodes.length > 0 && nodes[0].type === 'root' && (
                <PulseRing
                  cx={nodes[0].x}
                  cy={nodes[0].y}
                  r={nodes[0].size / 2 + 6}
                  color={theme.primary}
                />
              )}

              {/* Data Flow Particles */}
              {edges.slice(0, 10).map((edge, i) => {
                const from = nodes.find((n) => n.id === edge.from);
                const to = nodes.find((n) => n.id === edge.to);
                if (!from || !to) return null;
                return (
                  <EdgeParticle 
                    key={`p-${i}`}
                    x1={from.x} y1={from.y} 
                    x2={to.x} y2={to.y} 
                    color={theme.primary} 
                  />
                );
              })}

              <Svg width={graphWidth} height={graphHeight}>
                <Defs>
                  <RadialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Root glow */}
                {nodes.length > 0 && nodes[0].type === 'root' && (
                  <SvgCircle
                    cx={nodes[0].x}
                    cy={nodes[0].y}
                    r={nodes[0].size + 20}
                    fill="url(#rootGlow)"
                  />
                )}

                {/* Edges with strength-based styling */}
                {edges.map((edge, i) => {
                  const from = nodes.find((n) => n.id === edge.from);
                  const to = nodes.find((n) => n.id === edge.to);
                  if (!from || !to) return null;
                  const isHighlighted =
                    selectedNode === edge.from || selectedNode === edge.to;
                  return (
                    <Line
                      key={`e-${i}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isHighlighted ? theme.primary : theme.outlineVariant}
                      strokeWidth={isHighlighted ? 2 : Math.max(0.5, edge.strength * 2)}
                      strokeDasharray={edge.strength < 0.3 ? '4,4' : undefined}
                      opacity={isHighlighted ? 0.9 : 0.3 + edge.strength * 0.4}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  const r = node.size / 2;
                  return (
                    <React.Fragment key={node.id}>
                      {/* Outer ring on selected */}
                      {isSelected && (
                        <SvgCircle
                          cx={node.x}
                          cy={node.y}
                          r={r + 4}
                          fill="none"
                          stroke={theme.primary}
                          strokeWidth={2}
                        />
                      )}
                      {/* Node circle */}
                      <SvgCircle
                        cx={node.x}
                        cy={node.y}
                        r={r}
                        fill={nodeFill(node.type)}
                        onPress={() => handleNodePress(node.id)}
                      />
                      {/* Label */}
                      <SvgText
                        x={node.x}
                        y={node.y + (node.type === 'root' ? -2 : 1)}
                        fill={nodeTextColor(node.type)}
                        fontSize={node.type === 'root' ? 10 : node.type === 'primary' ? 9 : 8}
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {node.label.split('\n')[0]}
                      </SvgText>
                      {node.label.includes('\n') && (
                        <SvgText
                          x={node.x}
                          y={node.y + 10}
                          fill={nodeTextColor(node.type)}
                          fontSize={10}
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {node.label.split('\n')[1]}
                        </SvgText>
                      )}
                      {/* Count badge */}
                      {node.count > 0 && (
                        <>
                          <SvgCircle
                            cx={node.x + r * 0.7}
                            cy={node.y - r * 0.7}
                            r={8}
                            fill={theme.primary}
                          />
                          <SvgText
                            x={node.x + r * 0.7}
                            y={node.y - r * 0.7 + 3.5}
                            fill={theme.onPrimary}
                            fontSize={8}
                            fontWeight="700"
                            textAnchor="middle"
                          >
                            {node.count}
                          </SvgText>
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </Svg>
            </Animated.View>
            </GestureDetector>
          )}

          {/* Legend + Controls row */}
          <View style={styles.graphFooter}>
            <View style={styles.legendRow}>
              <View style={[styles.legendPill, { backgroundColor: theme.surfaceContainerHigh }]}>
                <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.legendText, { color: theme.onSurfaceVariant }]}>Root</Text>
              </View>
              <View style={[styles.legendPill, { backgroundColor: theme.surfaceContainerHigh }]}>
                <View style={[styles.legendDot, { backgroundColor: theme.secondary || theme.primaryContainer }]} />
                <Text style={[styles.legendText, { color: theme.onSurfaceVariant }]}>Primary</Text>
              </View>
              <View style={[styles.legendPill, { backgroundColor: theme.surfaceContainerHigh }]}>
                <View style={[styles.legendDot, { backgroundColor: theme.tertiary || theme.surfaceContainerHigh }]} />
                <Text style={[styles.legendText, { color: theme.onSurfaceVariant }]}>Secondary</Text>
              </View>
            </View>
            <View style={styles.controlRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.controlBtn,
                  { backgroundColor: generating ? theme.primaryContainer : theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleGenerateAll}
                disabled={generating}
              >
                <Ionicons name="sparkles" size={18} color={generating ? theme.onPrimaryContainer : theme.primary} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.controlBtn,
                  { backgroundColor: theme.surfaceContainerHigh, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleLoadSuggestions}
              >
                <Ionicons name="bulb" size={18} color={theme.primary} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* ── Selected node detail popover ──────────────────── */}
        {selectedNode && (() => {
          const node = nodes.find(n => n.id === selectedNode);
          const nodeConns = connections.filter((c: any) =>
            (c.from_id || c.from || c.activity_1_title) === selectedNode ||
            (c.to_id || c.to || c.activity_2_title) === selectedNode
          );
          return (
            <Animated.View entering={FadeInDown.duration(200)} style={[styles.nodePopover, { backgroundColor: theme.surfaceContainerHigh, borderColor: theme.outlineVariant }]}>
              <View style={styles.nodePopoverHeader}>
                <View style={[styles.nodeDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.nodePopoverTitle, { color: theme.onSurface }]} numberOfLines={2}>
                  {node?.label || selectedNode}
                </Text>
                <Pressable onPress={() => setSelectedNode(null)}>
                  <Ionicons name="close" size={18} color={theme.onSurfaceVariant} />
                </Pressable>
              </View>
              <Text style={[styles.nodePopoverSub, { color: theme.onSurfaceVariant }]}>
                {nodeConns.length} connection{nodeConns.length !== 1 ? 's' : ''}
              </Text>
              {nodeConns.slice(0, 3).map((c: any, i: number) => (
                <Text key={i} style={[styles.nodePopoverConn, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                  {(c.connection_type || 'link').toUpperCase()}: {c.activity_1_title || c.from || '?'} → {c.activity_2_title || c.to || '?'}
                </Text>
              ))}
            </Animated.View>
          );
        })()}

        {/* ── AI Generation progress ──────────────────────────── */}
        {generating && (
          <View style={styles.progressWrap}>
            <AIProgress state="processing" currentStep={genStep} />
          </View>
        )}
        {!generating && genCount > 0 && (
          <View style={styles.progressWrap}>
            <AIProgress state="result" resultCount={genCount} onView={() => {}} />
          </View>
        )}

        {/* ── Suggestions ─────────────────────────────────────── */}
        {suggestions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
              AI SUGGESTIONS
            </Text>
            {suggestions.slice(0, 4).map((s: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.suggestionCard,
                  { backgroundColor: theme.surfaceContainer, borderColor: theme.outlineVariant },
                ]}
              >
                <View style={[styles.suggestionIcon, { backgroundColor: (theme.tertiaryContainer || theme.primaryContainer) }]}>
                  <Ionicons name="sparkles" size={14} color={theme.tertiary || theme.primary} />
                </View>
                <Text style={[styles.suggestionText, { color: theme.onSurface }]}>
                  {typeof s === 'string' ? s : s.suggestion || s.title || JSON.stringify(s)}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Connections List ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>
              CONNECTIONS
            </Text>
            <View style={[styles.countBadge, { backgroundColor: theme.primaryContainer }]}>
              <Text style={[styles.countText, { color: theme.onPrimaryContainer }]}>
                {connections.length}
              </Text>
            </View>
          </View>

          {connections.length === 0 && !loading && (
            <EmptyState variant="empty-connections" onCTA={handleGenerateAll} />
          )}

          {connections.slice(0, 12).map((conn: any, i: number) => (
            <Animated.View
              key={conn.id || i}
              entering={FadeInDown.delay(80 + i * 40).springify()}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.neuralCard,
                  styles.shadowLight,
                  {
                    backgroundColor: theme.surfaceContainer,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ] as any}
                onPress={() => hapticSelection()}
              >
                <View style={styles.neuralCardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: connTypeColor(conn.connection_type) }]}>
                    <Ionicons 
                      name={
                        conn.connection_type?.toLowerCase().includes('causal') ? 'flash-outline' :
                        conn.connection_type?.toLowerCase().includes('thematic') ? 'apps-outline' :
                        'link-outline'
                      } 
                      size={12} 
                      color={connTypeTextColor(conn.connection_type)} 
                    />
                    <Text style={[styles.typeText, { color: connTypeTextColor(conn.connection_type) }]}>
                      {(conn.connection_type || 'Insight').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.strengthIndicator}>
                    <Text style={[styles.strengthLabel, { color: theme.onSurfaceVariant }]}>Strength</Text>
                    <View style={styles.miniStrengthBar}>
                       <View style={[styles.miniStrengthFill, { backgroundColor: theme.primary, width: `${(conn.strength || 0.5) * 100}%` }]} />
                    </View>
                  </View>
                </View>

                <View style={styles.neuralFlow}>
                  <View style={styles.nodePoint}>
                    <View style={[styles.nodeDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.nodeLabel, { color: theme.onSurface }]} numberOfLines={1}>
                      {conn.activity_1_title || conn.from || 'Source'}
                    </Text>
                  </View>
                  
                  <View style={styles.flowConnector}>
                    <View style={[styles.flowLine, { backgroundColor: theme.outlineVariant }]} />
                    <View style={[styles.flowCircle, { borderColor: theme.outlineVariant, backgroundColor: theme.surfaceContainer }]} />
                    <View style={[styles.flowLine, { backgroundColor: theme.outlineVariant }]} />
                  </View>

                  <View style={styles.nodePoint}>
                    <View style={[styles.nodeDot, { backgroundColor: theme.secondary || theme.primaryContainer }]} />
                    <Text style={[styles.nodeLabel, { color: theme.onSurfaceVariant }]} numberOfLines={1}>
                      {conn.activity_2_title || conn.to || 'Target'}
                    </Text>
                  </View>
                </View>

                {conn.shared_context && (
                  <Text style={[styles.contextText, { color: theme.onSurfaceVariant }]} numberOfLines={2}>
                    "{conn.shared_context}"
                  </Text>
                )}
              </Pressable>
            </Animated.View>
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

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: m3Radii['2xl'],
    gap: 4,
  },
  statValue: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Graph Card */
  graphCard: {
    marginHorizontal: 16,
    borderRadius: m3Radii['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: spacing.sm,
  },
  graphLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: m3Typography.labelMedium.fontSize,
    letterSpacing: 0.5,
  },
  graphFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 6,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: m3Typography.labelSmall.fontSize, fontWeight: '600', letterSpacing: 0.3 },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Progress */
  progressWrap: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  /* Sections */
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: m3Radii.full,
  },
  countText: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '700',
  },

  /* Suggestions */
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    borderRadius: m3Radii.xl,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: 22,
  },

  /* Neural Cards */
  neuralCard: {
    borderRadius: m3Radii['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.05)',
  },
  neuralCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  strengthIndicator: {
    alignItems: 'flex-end',
    gap: 4,
  },
  strengthLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  miniStrengthBar: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniStrengthFill: {
    height: '100%',
  },
  neuralFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  nodePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  flowConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  flowLine: {
    width: 16,
    height: 1,
  },
  flowCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  contextText: {
    fontSize: m3Typography.bodySmall.fontSize,
    lineHeight: 18,
    fontStyle: 'italic',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.05)',
  },

  /* Node popover */
  nodePopover: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: m3Radii['2xl'],
    borderWidth: 1,
  },
  nodePopoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodePopoverTitle: {
    flex: 1,
    fontSize: m3Typography.titleSmall.fontSize,
    fontWeight: '600',
  },
  nodePopoverSub: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 4,
    marginBottom: 8,
  },
  nodePopoverConn: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginTop: 2,
  },
  
  /* Shadows */
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});
