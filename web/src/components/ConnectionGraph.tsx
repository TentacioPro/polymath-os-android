'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Activity, Connection } from '@/lib/types';

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
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

// Category color mapping
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
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Calculate dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 600,
          height: Math.max(400, window.innerHeight - 300),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform data for force graph
  const graphData: GraphData = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Create activity lookup
    const activityMap = new Map(activities.map(a => [a.id, a]));

    // Add nodes from connections
    connections.forEach((conn) => {
      // From node
      if (!nodeMap.has(conn.from_id)) {
        const activity = activityMap.get(conn.from_id);
        nodeMap.set(conn.from_id, {
          id: conn.from_id,
          name: activity?.title || conn.from_id.slice(0, 8),
          category: activity?.category || 'Other',
          val: 1,
        });
      } else {
        const node = nodeMap.get(conn.from_id)!;
        node.val += 1;
      }

      // To node
      if (!nodeMap.has(conn.to_id)) {
        const activity = activityMap.get(conn.to_id);
        nodeMap.set(conn.to_id, {
          id: conn.to_id,
          name: activity?.title || conn.to_id.slice(0, 8),
          category: activity?.category || 'Other',
          val: 1,
        });
      } else {
        const node = nodeMap.get(conn.to_id)!;
        node.val += 1;
      }

      // Add link
      links.push({
        source: conn.from_id,
        target: conn.to_id,
        type: conn.connection_type,
        reasoning: conn.reasoning || conn.ai_reasoning || '',
        strength: conn.strength || 0.5,
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links,
    };
  }, [connections, activities]);

  const getNodeColor = (node: GraphNode) => {
    return CATEGORY_COLORS[node.category || 'Other'] || CATEGORY_COLORS.Other;
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  if (!connections.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="material-symbols-outlined text-[48px] text-poly-border-muted">hub</span>
        <p className="text-[14px] text-poly-muted mt-3">No connections yet</p>
        <p className="text-[12px] text-poly-muted mt-1">Generate connections from the Timeline view</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Graph Container */}
      <div 
        ref={containerRef}
        className="relative border border-poly-border-muted overflow-hidden"
        style={{ 
          backgroundColor: 'var(--poly-bg)', 
          borderRadius: '14px',
          height: dimensions.height,
        }}
      >
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.name}\n${node.category || 'Other'}`}
          nodeColor={(node: any) => getNodeColor(node)}
          nodeRelSize={6}
          nodeVal={(node: any) => Math.max(1, node.val) * 2}
          linkColor={() => 'rgba(var(--poly-accent-rgb), 0.3)'}
          linkWidth={(link: any) => link.strength * 2 + 0.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => 'var(--poly-accent)'}
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
            
            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();
            
            // Draw border for selected/hovered
            if (selectedNode?.id === node.id || hoveredNode?.id === node.id) {
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }
            
            // Draw label
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
          }}
        />

        {/* Controls overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="bg-poly-surface/90 backdrop-blur px-3 py-2" style={{ borderRadius: '8px' }}>
            <p className="text-[10px] text-poly-muted uppercase tracking-wider mb-1">Nodes</p>
            <p className="text-[14px] font-bold text-poly-text">{graphData.nodes.length}</p>
          </div>
          <div className="bg-poly-surface/90 backdrop-blur px-3 py-2" style={{ borderRadius: '8px' }}>
            <p className="text-[10px] text-poly-muted uppercase tracking-wider mb-1">Links</p>
            <p className="text-[14px] font-bold text-poly-text">{graphData.links.length}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-poly-surface/90 backdrop-blur p-3" style={{ borderRadius: '8px' }}>
          <p className="text-[9px] text-poly-muted uppercase tracking-wider mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2" style={{ backgroundColor: color, borderRadius: '50%' }} />
                <span className="text-[9px] text-poly-text">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div 
          className="border border-poly-border-muted p-4"
          style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ backgroundColor: getNodeColor(selectedNode), borderRadius: '10px' }}
            >
              <span className="material-symbols-outlined text-[20px] text-white">hub</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-poly-text truncate">
                {selectedNode.name}
              </h3>
              <p className="text-[11px] text-poly-muted mt-0.5">
                Category: {selectedNode.category || 'Other'} • {selectedNode.val} connection{selectedNode.val !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-poly-muted hover:text-poly-text"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Related connections */}
          <div className="mt-3 pt-3 border-t border-poly-border-muted">
            <p className="text-[10px] text-poly-muted uppercase tracking-wider mb-2">Related Connections</p>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
              {graphData.links
                .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                .slice(0, 5)
                .map((link, i) => (
                  <div key={i} className="text-[11px] text-poly-text bg-poly-bg p-2" style={{ borderRadius: '6px' }}>
                    <span className="font-medium">{link.type}</span>
                    {link.reasoning && (
                      <span className="text-poly-muted ml-2">{link.reasoning.slice(0, 80)}...</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-[11px] text-poly-muted text-center">
        Drag to pan • Scroll to zoom • Click nodes for details
      </p>
    </div>
  );
}
