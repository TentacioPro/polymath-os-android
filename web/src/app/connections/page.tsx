'use client';

import { useState } from 'react';
import {
  useConnections,
  useGenerateConnections,
  useSuggestions,
} from '@/hooks/useConnections';
import { useActivities } from '@/hooks/useActivities';
import { Sparkles, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';

type View = 'timeline' | 'graph' | 'suggestions';

export default function ConnectionsPage() {
  const [view, setView] = useState<View>('timeline');
  const { data: activities } = useActivities();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const generateConnections = useGenerateConnections();
  const {
    data: suggestions,
    refetch: fetchSuggestions,
    isLoading: suggestionsLoading,
    isFetching: suggestionsFetching,
  } = useSuggestions();

  const tabs: { key: View; label: string }[] = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'graph', label: 'Graph' },
    { key: 'suggestions', label: 'Suggestions' },
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
        return 'bg-poly-pink';
      case 'medium':
        return 'bg-poly-amber';
      default:
        return 'bg-poly-blue';
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-poly-text">Dots to Connect</h1>
        <p className="text-sm text-poly-muted mt-1">
          Discover relationships between your learning
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-poly-card p-2 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              view === tab.key
                ? 'bg-poly-border text-poly-indigo'
                : 'text-poly-dim hover:text-poly-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-0">
          {sortedActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-poly-indigo shrink-0" />
                {index < sortedActivities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-poly-border mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="bg-poly-card border border-poly-border rounded-xl p-4 mb-3 flex-1">
                <h3 className="text-base font-semibold text-poly-text mb-1">
                  {activity.title}
                </h3>
                <p className="text-xs text-poly-dim mb-3">
                  {new Date(activity.timestamp).toLocaleDateString()} •{' '}
                  {activity.source}
                </p>
                <button
                  onClick={() => generateConnections.mutate(activity.id)}
                  disabled={generateConnections.isPending}
                  className="bg-poly-indigo/20 text-poly-indigo text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-poly-indigo/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {generateConnections.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Generate Connections
                </button>
              </div>
            </div>
          ))}

          {sortedActivities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-poly-muted">No activities yet</p>
              <p className="text-sm text-poly-dim mt-2">
                Add some activities first to discover connections
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graph View */}
      {view === 'graph' && (
        <div className="space-y-3">
          {connectionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-poly-indigo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : connections && connections.length > 0 ? (
            connections.map((conn) => (
              <div
                key={conn.id}
                className="bg-poly-card border border-poly-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* From node */}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-poly-indigo" />
                    <span className="text-sm font-medium text-poly-text truncate max-w-[180px]">
                      {conn.from_id}
                    </span>
                  </div>

                  <ArrowRight size={16} className="text-poly-dim shrink-0" />

                  {/* To node */}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-poly-green" />
                    <span className="text-sm font-medium text-poly-text truncate max-w-[180px]">
                      {conn.to_id}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-poly-dim italic mb-2">
                  {conn.connection_type}
                </p>

                <div className="border-t border-poly-border pt-2">
                  <p className="text-sm text-poly-muted">{conn.reasoning}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-poly-muted">No connections yet</p>
              <p className="text-sm text-poly-dim mt-2">
                Generate connections from the Timeline view
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions View */}
      {view === 'suggestions' && (
        <div>
          <button
            onClick={() => fetchSuggestions()}
            disabled={suggestionsFetching}
            className="bg-poly-indigo rounded-xl px-4 py-3 flex items-center justify-center gap-2 w-full mb-6 hover:bg-poly-indigo/90 transition-colors disabled:opacity-50"
          >
            {suggestionsFetching ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Sparkles size={20} className="text-white" />
            )}
            <span className="text-white text-sm font-semibold">
              {suggestionsFetching ? 'Generating...' : 'Generate AI Suggestions'}
            </span>
          </button>

          <div className="space-y-3">
            {suggestions?.map((suggestion: any, index: number) => (
              <div
                key={suggestion.id || index}
                className="bg-poly-card border border-poly-border rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-poly-amber shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-md ${getPriorityColor(
                          suggestion.priority
                        )}`}
                      >
                        {suggestion.priority || 'Normal'}
                      </span>
                    </div>
                    <p className="text-sm text-poly-text mb-1.5">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-xs text-poly-dim">{suggestion.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!suggestions?.length && !suggestionsFetching && (
            <div className="text-center py-12">
              <p className="text-sm text-poly-dim">
                Click &quot;Generate AI Suggestions&quot; to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
