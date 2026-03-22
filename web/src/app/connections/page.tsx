'use client';

import { useState } from 'react';
import {
  useConnections,
  useGenerateConnections,
  useSuggestions,
} from '@/hooks/useConnections';
import { useActivities } from '@/hooks/useActivities';
import ConnectionGraph from '@/components/ConnectionGraph';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/ui/EmptyState';

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
  const toast = useToast();

  const handleGenerate = async (activityId: string) => {
    try {
      await generateConnections.mutateAsync(activityId);
      toast.success('Connections generated');
    } catch {
      toast.error('Failed to generate connections');
    }
  };

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
        return 'bg-m3-error-container text-m3-error';
      case 'medium':
        return 'bg-m3-warning-container text-m3-warning';
      default:
        return 'bg-m3-info-container text-m3-info';
    }
  };

  return (
    <div className="@container pt-4 flex flex-col gap-4 stagger-children">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">
          Neural Mesh
        </h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">
          Correlation & discovery
        </p>
      </div>

      {/* Tabs — M3 segmented button */}
      <div className="flex gap-0 border border-m3-outline-variant overflow-hidden rounded-2xl bg-m3-surface-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-standard ${
              view === tab.key
                ? 'bg-m3-primary text-m3-on-primary'
                : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface'
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
                <div className="w-2.5 h-2.5 rounded-full bg-m3-primary shrink-0" />
                {index < sortedActivities.length - 1 && (
                  <div className="w-px flex-1 bg-m3-outline-variant mt-1" />
                )}
              </div>

              {/* Card */}
              <div className="rounded-2xl bg-m3-surface-container border border-m3-outline-variant p-4 mb-3 flex-1">
                <h3 className="text-[14px] font-semibold text-m3-on-surface mb-1">
                  {activity.title}
                </h3>
                <p className="text-[11px] text-m3-on-surface-variant mb-3">
                  {new Date(activity.timestamp).toLocaleDateString()} &middot;{' '}
                  {activity.source}
                </p>
                <button
                  onClick={() => handleGenerate(activity.id)}
                  disabled={generateConnections.isPending}
                  className="rounded-xl border border-m3-outline-variant text-m3-primary text-[11px] font-bold px-3 py-1.5 hover:bg-m3-primary-container transition-standard flex items-center gap-1.5 disabled:opacity-50"
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
            <EmptyState variant="empty-connections" />
          )}
        </div>
      )}

      {/* Graph View */}
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
            className="w-full bg-m3-primary text-m3-on-primary rounded-2xl py-3 text-[14px] font-bold hover:opacity-90 transition-standard disabled:opacity-50 flex items-center justify-center gap-2"
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

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
            {suggestions?.map((suggestion: any, index: number) => (
              <div
                key={suggestion.id || index}
                className="rounded-2xl bg-m3-surface-container border border-m3-outline-variant p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-m3-warning shrink-0 mt-0.5">
                    lightbulb
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 uppercase rounded-full ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority || 'Normal'}
                      </span>
                    </div>
                    <p className="text-[13px] text-m3-on-surface mb-1.5 prose-line-cap">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-[11px] text-m3-on-surface-variant prose-line-cap">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!suggestions?.length && !suggestionsFetching && (
            <div className="flex flex-col items-center py-12">
              <p className="text-[12px] text-m3-on-surface-variant">
                Click &quot;Generate AI Suggestions&quot; to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
