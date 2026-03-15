'use client';

import { useState } from 'react';
import {
  useConnections,
  useGenerateConnections,
  useSuggestions,
} from '@/hooks/useConnections';
import { useActivities } from '@/hooks/useActivities';
import ConnectionGraph from '@/components/ConnectionGraph';

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
    <div className="pt-4 flex flex-col gap-4">
      {/* Header — matching mobile */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">
          Neural Mesh
        </h1>
        <p className="text-[12px] text-poly-muted mt-0.5">
          Correlation & discovery
        </p>
      </div>

      {/* Tabs — rounded matching mobile */}
      <div className="flex gap-0 border border-poly-border-muted overflow-hidden" style={{ borderRadius: '12px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              view === tab.key
                ? 'bg-poly-accent'
                : 'text-poly-muted hover:text-poly-text'
            }`}
            style={{ color: view === tab.key ? 'var(--poly-accent-text)' : undefined }}
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
                <div className="w-2.5 h-2.5 bg-poly-accent shrink-0" style={{ borderRadius: '50%' }} />
                {index < sortedActivities.length - 1 && (
                  <div className="w-px flex-1 bg-poly-border mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="border border-poly-border-muted p-4 mb-3 flex-1" style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}>
                <h3 className="text-[14px] font-semibold text-poly-text mb-1">
                  {activity.title}
                </h3>
                <p className="text-[11px] text-poly-muted mb-3">
                  {new Date(activity.timestamp).toLocaleDateString()} &middot;{' '}
                  {activity.source}
                </p>
                <button
                  onClick={() => generateConnections.mutate(activity.id)}
                  disabled={generateConnections.isPending}
                  className="border border-poly-border-muted text-poly-accent text-[11px] font-bold px-3 py-1.5 hover:bg-poly-accent transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  style={{ borderRadius: '8px' }}
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
            <div className="flex flex-col items-center py-16">
              <span className="material-symbols-outlined text-[48px] text-poly-border-muted">hub</span>
              <p className="text-[14px] text-poly-muted mt-3">No activities yet</p>
              <p className="text-[12px] text-poly-muted mt-1">Add some activities first to discover connections</p>
            </div>
          )}
        </div>
      )}

      {/* Graph View — Interactive Force Graph */}
      {view === 'graph' && (
        <ConnectionGraph
          connections={connections || []}
          activities={activities || []}
          onNodeClick={(node) => console.log('Node clicked:', node)}
        />
      )}

      {/* Suggestions View */}
      {view === 'suggestions' && (
        <div className="flex flex-col gap-6">
          <button
            onClick={() => fetchSuggestions()}
            disabled={suggestionsFetching}
            className="w-full bg-poly-accent py-3 text-[14px] font-bold hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ color: 'var(--poly-accent-text)', borderRadius: '14px' }}
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
                className="border border-poly-border-muted p-4"
                style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-amber-400 shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 uppercase"
                        style={{
                          backgroundColor: getPriorityColor(suggestion.priority),
                          color: '#FFFFFF',
                          borderRadius: '6px',
                        }}
                      >
                        {suggestion.priority || 'Normal'}
                      </span>
                    </div>
                    <p className="text-[13px] text-poly-text mb-1.5">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-[11px] text-poly-muted">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!suggestions?.length && !suggestionsFetching && (
            <div className="flex flex-col items-center py-12">
              <p className="text-[12px] text-poly-muted">
                Click &quot;Generate AI Suggestions&quot; to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
