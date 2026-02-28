'use client';

import { useState } from 'react';
import {
  useConnections,
  useGenerateConnections,
  useSuggestions,
} from '@/hooks/useConnections';
import { useActivities } from '@/hooks/useActivities';

type View = 'timeline' | 'graph' | 'suggestions';

export default function ConnectionsPage() {
  const [view, setView] = useState<View>('timeline');
  const { data: activities } = useActivities();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const generateConnections = useGenerateConnections();
  const {
    data: suggestions,
    refetch: fetchSuggestions,
    isFetching: suggestionsFetching,
  } = useSuggestions();

  const tabs: { key: View; label: string; icon: string }[] = [
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
    { key: 'graph', label: 'Graph', icon: 'hub' },
    { key: 'suggestions', label: 'Suggest', icon: 'lightbulb' },
  ];

  const sortedActivities = activities
    ? [...activities].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ec4899';
      case 'medium':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
          Neural Mesh
        </h1>
        <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
          Correlation // Discovery
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-poly-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold transition-colors border-r border-poly-border last:border-r-0 ${
              view === tab.key
                ? 'bg-poly-accent text-poly-accent-text'
                : 'text-poly-muted hover:text-poly-text'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="flex flex-col gap-0">
          {sortedActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center pt-1.5">
                <div className="w-2.5 h-2.5 bg-poly-accent shrink-0" />
                {index < sortedActivities.length - 1 && (
                  <div className="w-px flex-1 bg-poly-border mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="border border-poly-border bg-poly-surface p-4 mb-3 flex-1">
                <h3 className="text-sm font-display font-bold text-poly-text mb-1 uppercase">
                  {activity.title}
                </h3>
                <p className="text-[10px] font-mono text-poly-dim mb-3">
                  {new Date(activity.timestamp).toLocaleDateString()} &middot;{' '}
                  {activity.source}
                </p>
                <button
                  onClick={() => generateConnections.mutate(activity.id)}
                  disabled={generateConnections.isPending}
                  className="border border-poly-border text-poly-accent text-[10px] font-mono font-bold px-3 py-1.5 hover:bg-poly-accent hover:text-poly-accent-text transition-colors flex items-center gap-1.5 disabled:opacity-50 uppercase tracking-wider"
                >
                  {generateConnections.isPending ? (
                    <span className="material-symbols-outlined text-[14px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px]">
                      auto_awesome
                    </span>
                  )}
                  Generate
                </button>
              </div>
            </div>
          ))}

          {sortedActivities.length === 0 && (
            <div className="text-center py-16 border border-poly-border-muted">
              <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
                hub
              </span>
              <p className="text-sm font-display font-bold text-poly-muted uppercase">
                No activities yet
              </p>
              <p className="text-[10px] font-mono text-poly-dim mt-2">
                Add some activities first to discover connections
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graph View */}
      {view === 'graph' && (
        <div className="flex flex-col gap-0">
          {connectionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
            </div>
          ) : connections && connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="border border-poly-border bg-poly-surface p-4"
                >
                <div className="flex items-center gap-3 mb-3">
                  {/* From node */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-poly-accent" />
                    <span className="text-[11px] font-mono text-poly-text truncate max-w-[150px] uppercase">
                      {conn.from_id}
                    </span>
                  </div>

                  <span className="material-symbols-outlined text-[14px] text-poly-dim shrink-0">
                    arrow_forward
                  </span>

                  {/* To node */}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-poly-green" />
                    <span className="text-[11px] font-mono text-poly-text truncate max-w-[150px] uppercase">
                      {conn.to_id}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-poly-dim uppercase tracking-wider mb-2">
                  {conn.connection_type}
                </p>

                <div className="border-t border-poly-border-muted pt-2">
                  <p className="text-xs text-poly-muted leading-relaxed">
                    {conn.reasoning}
                  </p>
                </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-poly-border-muted">
              <span className="material-symbols-outlined text-[48px] text-poly-dim mb-4 block">
                hub
              </span>
              <p className="text-sm font-display font-bold text-poly-muted uppercase">
                No connections yet
              </p>
              <p className="text-[10px] font-mono text-poly-dim mt-2">
                Generate connections from the Timeline view
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions View */}
      {view === 'suggestions' && (
        <div className="flex flex-col gap-6">
          <button
            onClick={() => fetchSuggestions()}
            disabled={suggestionsFetching}
            className="w-full bg-poly-accent text-poly-accent-text py-3 font-mono text-xs uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 architect-shadow-sm flex items-center justify-center gap-2"
          >
            {suggestionsFetching ? (
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
            )}
            {suggestionsFetching ? 'Generating...' : 'Generate AI Suggestions'}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions?.map((suggestion: any, index: number) => (
              <div
                key={suggestion.id || index}
                className="border border-poly-border bg-poly-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-poly-amber shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase"
                        style={{
                          backgroundColor: getPriorityColor(suggestion.priority),
                          color: '#FFFFFF',
                        }}
                      >
                        {suggestion.priority || 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-poly-text mb-1.5">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-[10px] font-mono text-poly-dim">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!suggestions?.length && !suggestionsFetching && (
            <div className="text-center py-12 border border-poly-border-muted">
              <p className="text-[10px] font-mono text-poly-dim uppercase tracking-wider">
                Click &quot;Generate AI Suggestions&quot; to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
