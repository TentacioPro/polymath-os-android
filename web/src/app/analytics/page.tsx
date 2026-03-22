'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, a, h] = await Promise.all([
      api.getStats().then((r) => r.data).catch(() => null),
      api.getAgentStats().then((r) => r.data).catch(() => null),
      api.getHealth().then((r) => r.data).catch(() => null),
    ]);
    setStats(s);
    setAgentStats(a);
    setHealth(h);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  const StatBox = ({ icon, value, label }: { icon: string; value: string | number; label: string }) => (
    <div className="flex flex-col items-center gap-1 py-4 px-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant">
      <span className="material-symbols-outlined text-[20px] text-m3-primary">{icon}</span>
      <span className="text-[20px] font-bold text-m3-on-surface">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-m3-on-surface-variant">{label}</span>
    </div>
  );

  const topics = stats?.topic_distribution || Object.entries(stats?.categories || {}).map(([t, c]) => ({ topic: t, count: c }));
  const sources = stats?.source_distribution || [];

  return (
    <div className="@container pt-4 flex flex-col gap-5">
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">Analytics</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">System diagnostics</p>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Overview</p>
        <div className="grid grid-cols-3 gap-2">
          <StatBox icon="layers" value={stats?.total_activities || 0} label="Activities" />
          <StatBox icon="hub" value={stats?.total_connections || 0} label="Connections" />
          <StatBox icon="menu_book" value={stats?.total_journals || 0} label="Journals" />
        </div>
      </div>

      {agentStats && (
        <div>
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Agent</p>
          <div className="grid grid-cols-3 gap-2">
            <StatBox icon="memory" value={agentStats?.total_memories || 0} label="Memories" />
            <StatBox icon="chat" value={agentStats?.total_queries || 0} label="Queries" />
            <StatBox icon="person" value={agentStats?.persona_name || '—'} label="Persona" />
          </div>
        </div>
      )}

      {topics?.length > 0 && (
        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant">
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-3">Topics</p>
          <div className="flex flex-col gap-2">
            {topics.slice(0, 8).map((t: any) => {
              const maxCount = Math.max(...topics.map((x: any) => x.count || 0), 1);
              return (
                <div key={t.topic || t[0]} className="flex items-center gap-3">
                  <span className="text-[12px] text-m3-on-surface w-24 truncate">{t.topic || t[0]}</span>
                  <div className="flex-1 h-2 bg-m3-outline-variant overflow-hidden rounded-full">
                    <div
                      className="h-full bg-m3-primary rounded-full"
                      style={{ width: `${((t.count || t[1]) / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-m3-primary w-6 text-right">{t.count || t[1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div className="p-4 rounded-3xl bg-m3-surface-container border border-m3-outline-variant">
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-3">Sources</p>
          <div className="flex flex-col gap-2">
            {sources.slice(0, 8).map((s: any) => {
              const maxCount = Math.max(...sources.map((x: any) => x.count || 0), 1);
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-[12px] text-m3-on-surface w-24 truncate">{s.source}</span>
                  <div className="flex-1 h-2 bg-m3-outline-variant overflow-hidden rounded-full">
                    <div
                      className="h-full bg-m3-primary rounded-full"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-m3-primary w-6 text-right">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">System</p>
        <div className="grid grid-cols-3 gap-2">
          <StatBox icon="check_circle" value={health ? 'Healthy' : 'Offline'} label="Status" />
          <StatBox icon="database" value={health?.database ? 'Up' : 'Down'} label="Database" />
          <StatBox icon="auto_awesome" value={health?.ai_available ? 'On' : 'Off'} label="AI" />
        </div>
      </div>
    </div>
  );
}
