'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Activity, Connection } from '@/lib/types';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  category?: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  reasoning: string;
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface ConnectionGraphProps {
  connections: Connection[];
  activities: Activity[];
  onNodeClick?: (node: GraphNode) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: '#8B5CF6',
  News: '#3B82F6',
  Tools: '#10B981',
  Market: '#F59E0B',
  Research: '#EC4899',
  Tutorial: '#06B6D4',
  Other: '#6B7280',
};

export default function ConnectionGraph({ connections, activities, onNodeClick }: ConnectionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 600,
          height: isFullscreen ? window.innerHeight : Math.max(400, window.innerHeight - 300),
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  const graphData: GraphData = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];
    const activityMap = new Map(activities.map(a => [a.id, a]));

    connections.forEach((conn) => {
      if (!nodeMap.has(conn.from_id)) {
        const activity = activityMap.get(conn.from_id);
        nodeMap.set(conn.from_id, {
          id: conn.from_id,
          name: activity?.title || conn.from_id.slice(0, 8),
          category: activity?.category || 'Other',
          val: 1,
        });
      } else {
        nodeMap.get(conn.from_id)!.val += 1;
      }

      if (!nodeMap.has(conn.to_id)) {
        const activity = activityMap.get(conn.to_id);
        nodeMap.set(conn.to_id, {
          id: conn.to_id,
          name: activity?.title || conn.to_id.slice(0, 8),
          category: activity?.category || 'Other',
          val: 1,
        });
      } else {
        nodeMap.get(conn.to_id)!.val += 1;
      }

      links.push({
        source: conn.from_id,
        target: conn.to_id,
        type: conn.connection_type,
        reasoning: conn.reasoning || conn.ai_reasoning || '',
        strength: conn.strength || 0.5,
      });
    });

    return { nodes: Array.from(nodeMap.values()), links };
  }, [connections, activities]);

  // Search highlighting
  const matchedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    return new Set(
      graphData.nodes
        .filter(n => n.name.toLowerCase().includes(q) || (n.category || '').toLowerCase().includes(q))
        .map(n => n.id)
    );
  }, [searchQuery, graphData.nodes]);

  const getNodeColor = useCallback((node: GraphNode) => {
    if (searchQuery && matchedNodeIds.size > 0 && !matchedNodeIds.has(node.id)) {
      return 'rgba(100,100,100,0.25)';
    }
    return CATEGORY_COLORS[node.category || 'Other'] || CATEGORY_COLORS.Other;
  }, [searchQuery, matchedNodeIds]);

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.4, 400);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.4, 400);
  const handleZoomReset = () => graphRef.current?.zoomToFit(400, 40);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => graphRef.current?.zoomToFit(400, 40), 100);
  };

  if (!connections.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="material-symbols-outlined text-[48px] text-m3-on-surface-variant">hub</span>
        <p className="text-[14px] text-m3-on-surface-variant mt-3">No connections yet</p>
        <p className="text-[12px] text-m3-on-surface-variant mt-1">Generate connections from the Timeline view</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-m3-surface p-4' : ''}`}>
      {/* Graph Container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-m3-outline-variant overflow-hidden bg-m3-surface flex-1"
        style={{ height: isFullscreen ? '100%' : dimensions.height }}
      >
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={isFullscreen ? dimensions.height - 32 : dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name}\n${node.category || 'Other'}`}
          nodeColor={(node: any) => getNodeColor(node)}
          nodeRelSize={6}
          nodeVal={(node: any) => Math.max(1, node.val) * 2}
          linkColor={() => 'rgba(128,128,128,0.2)'}
          linkWidth={(link: any) => link.strength * 2 + 0.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => 'var(--m3-primary)'}
          onNodeClick={handleNodeClick}
          onNodeHover={(node: any) => setHoveredNode(node)}
          cooldownTicks={100}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          backgroundColor="transparent"
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name?.slice(0, 20) || '';
            const fontSize = 10 / globalScale;
            const nodeSize = Math.sqrt(node.val || 1) * 4;
            const isHighlighted = matchedNodeIds.has(node.id);

            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();

            if (selectedNode?.id === node.id || hoveredNode?.id === node.id || isHighlighted) {
              ctx.strokeStyle = isHighlighted ? '#FFEB3B' : '#FFFFFF';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = searchQuery && !matchedNodeIds.has(node.id)
              ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)';
            ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
          }}
        />

        {/* Search bar */}
        <div className="absolute top-3 left-3 right-20">
          <div className="relative max-w-65">
            <span className="material-symbols-outlined text-[18px] text-m3-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full bg-m3-surface-container/90 backdrop-blur text-m3-on-surface text-[12px] rounded-xl pl-9 pr-3 py-2 border border-m3-outline-variant focus:border-m3-primary outline-none transition-standard placeholder:text-m3-on-surface-variant"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <span className="material-symbols-outlined text-[16px] text-m3-on-surface-variant">close</span>
              </button>
            )}
          </div>
          {searchQuery && matchedNodeIds.size > 0 && (
            <p className="text-[10px] text-m3-primary mt-1 ml-1">{matchedNodeIds.size} match{matchedNodeIds.size !== 1 ? 'es' : ''}</p>
          )}
        </div>

        {/* Controls cluster */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {[
            { icon: 'add', action: handleZoomIn, label: 'Zoom in' },
            { icon: 'remove', action: handleZoomOut, label: 'Zoom out' },
            { icon: 'fit_screen', action: handleZoomReset, label: 'Reset' },
            { icon: isFullscreen ? 'fullscreen_exit' : 'fullscreen', action: toggleFullscreen, label: 'Fullscreen' },
          ].map(ctrl => (
            <button
              key={ctrl.icon}
              onClick={ctrl.action}
              title={ctrl.label}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-m3-surface-container/90 backdrop-blur border border-m3-outline-variant hover:bg-m3-surface-container-high transition-standard"
            >
              <span className="material-symbols-outlined text-[18px] text-m3-on-surface">{ctrl.icon}</span>
            </button>
          ))}
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 right-3 bg-m3-surface-container/90 backdrop-blur rounded-xl px-3 py-2 flex gap-4">
          <div>
            <p className="text-[9px] text-m3-on-surface-variant uppercase tracking-wider">Nodes</p>
            <p className="text-[14px] font-bold text-m3-on-surface">{graphData.nodes.length}</p>
          </div>
          <div>
            <p className="text-[9px] text-m3-on-surface-variant uppercase tracking-wider">Links</p>
            <p className="text-[14px] font-bold text-m3-on-surface">{graphData.links.length}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-m3-surface-container/90 backdrop-blur rounded-xl p-3">
          <p className="text-[9px] text-m3-on-surface-variant uppercase tracking-wider mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] text-m3-on-surface">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="rounded-2xl border border-m3-outline-variant bg-m3-surface-container p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl"
              style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category || 'Other'] || CATEGORY_COLORS.Other }}
            >
              <span className="material-symbols-outlined text-[20px] text-white">hub</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-m3-on-surface truncate">
                {selectedNode.name}
              </h3>
              <p className="text-[11px] text-m3-on-surface-variant mt-0.5">
                Category: {selectedNode.category || 'Other'} &middot; {selectedNode.val} connection{selectedNode.val !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-m3-on-surface-variant hover:text-m3-on-surface transition-standard"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-m3-outline-variant">
            <p className="text-[10px] text-m3-on-surface-variant uppercase tracking-wider mb-2">Related Connections</p>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {graphData.links
                .filter(l => {
                  const sid = typeof l.source === 'object' ? (l.source as any).id : l.source;
                  const tid = typeof l.target === 'object' ? (l.target as any).id : l.target;
                  return sid === selectedNode.id || tid === selectedNode.id;
                })
                .slice(0, 8)
                .map((link, i) => (
                  <div key={i} className="text-[11px] text-m3-on-surface bg-m3-surface rounded-xl p-2.5">
                    <span className="font-medium text-m3-primary">{link.type}</span>
                    {link.reasoning && (
                      <span className="text-m3-on-surface-variant ml-2">
                        {link.reasoning.length > 100 ? link.reasoning.slice(0, 100) + '...' : link.reasoning}
                      </span>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 bg-m3-outline-variant rounded-full overflow-hidden">
                        <div className="h-full bg-m3-primary rounded-full" style={{ width: `${(link.strength || 0.5) * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-m3-on-surface-variant">{Math.round((link.strength || 0.5) * 100)}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <p className="text-[11px] text-m3-on-surface-variant text-center">
          Drag to pan &middot; Scroll to zoom &middot; Click nodes for details
        </p>
      )}
    </div>
  );
}
