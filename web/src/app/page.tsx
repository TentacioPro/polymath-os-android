'use client';

import { useStats } from '@/hooks/useStats';
import { useActivities } from '@/hooks/useActivities';
import { getCategoryColor } from '@/lib/constants';
import Link from 'next/link';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl mode';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Night owl mode';
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useStats();
  const { data: activities, isLoading: activitiesLoading } = useActivities(10);

  const loading = statsLoading || activitiesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin mx-auto" style={{ borderRadius: '50%' }} />
          <p className="text-poly-muted mt-4 text-xs font-mono uppercase tracking-widest">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  const totalActivities = stats?.total_activities || 0;
  const totalJournals = stats?.total_journals || 0;
  const totalConnections = stats?.total_connections || 0;
  const categories = stats?.categories || {};
  const topCategories = Object.entries(categories).slice(0, 4);

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header — matching mobile: greeting + title + profile */}
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[1.5px] text-poly-muted mb-0.5">
            {getGreeting()}
          </p>
          <h1 className="text-[22px] font-bold text-poly-text tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="w-10 h-10 flex items-center justify-center text-poly-text transition-colors hover:text-poly-accent"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center bg-poly-accent"
            style={{ borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--poly-accent-text)' }}>person</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions — matching mobile 4-button row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: 'add', label: 'Add', href: '/chat', accent: true },
          { icon: 'chat_bubble_outline', label: 'Chat', href: '/chat', accent: false },
          { icon: 'search', label: 'Search', href: '/search', accent: false },
          { icon: 'edit_note', label: 'Journal', href: '/journal', accent: false },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center justify-center h-[52px] transition-opacity hover:opacity-80"
            style={{
              backgroundColor: action.accent ? 'var(--poly-accent)' : 'var(--poly-surface)',
              borderRadius: '14px',
            }}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ color: action.accent ? 'var(--poly-accent-text)' : 'var(--poly-text)' }}
            >
              {action.icon}
            </span>
          </Link>
        ))}
      </div>

      {/* Stats Row — matching mobile: 3 cards, last one accent-filled */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/activities"
          className="flex flex-col items-center gap-1 py-5 px-3 border border-poly-border-muted transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
        >
          <span className="material-symbols-outlined text-[20px] text-poly-accent">layers</span>
          <span className="text-[24px] font-bold text-poly-text">{totalActivities}</span>
          <span className="text-[10px] uppercase tracking-[1px] text-poly-muted">Activities</span>
        </Link>
        <Link
          href="/journal"
          className="flex flex-col items-center gap-1 py-5 px-3 border border-poly-border-muted transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
        >
          <span className="material-symbols-outlined text-[20px] text-poly-accent">menu_book</span>
          <span className="text-[24px] font-bold text-poly-text">{totalJournals}</span>
          <span className="text-[10px] uppercase tracking-[1px] text-poly-muted">Journals</span>
        </Link>
        <Link
          href="/connections"
          className="flex flex-col items-center gap-1 py-5 px-3 transition-colors hover:opacity-90 bg-poly-accent"
          style={{ borderRadius: '14px' }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--poly-accent-text)' }}>hub</span>
          <span className="text-[24px] font-bold" style={{ color: 'var(--poly-accent-text)' }}>{totalConnections}</span>
          <span className="text-[10px] uppercase tracking-[1px]" style={{ color: 'var(--poly-accent-text)', opacity: 0.8 }}>Mesh</span>
        </Link>
      </div>

      {/* Neural Mesh Card — matching mobile meshCard */}
      <Link
        href="/connections"
        className="block p-5 border border-poly-border-muted transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '16px' }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold text-poly-text">Neural Mesh</span>
            <div className="w-2 h-2 bg-green-500 animate-pulse" style={{ borderRadius: '50%' }} />
          </div>
          <span className="material-symbols-outlined text-[20px] text-poly-muted">arrow_forward</span>
        </div>
        <p className="text-[13px] text-poly-muted leading-[20px] mb-3">
          {totalConnections > 0
            ? `${totalConnections} connections discovered across your knowledge base.`
            : 'Start adding content to discover patterns and connections.'}
        </p>
        {/* Mini mesh visualization — matching mobile dots */}
        <div className="flex flex-wrap gap-3 justify-center pt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={i % 4 === 0 ? 'animate-pulse' : ''}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i % 4 === 0 ? 'var(--poly-accent)' : 'var(--poly-border-muted)',
                opacity: i % 4 === 0 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </Link>

      {/* Mid section: Top Domains + Recent Activity side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Domains — matching mobile categories section */}
        {topCategories.length > 0 && (
          <div
            className="p-5 border border-poly-border-muted"
            style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '16px' }}
          >
            <h3 className="text-[14px] font-bold text-poly-text mb-4">Top Domains</h3>
            <div className="flex flex-col">
              {topCategories.map(([name, count]: any, i) => (
                <div key={name} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2"
                      style={{
                        borderRadius: '50%',
                        backgroundColor: i === 0 ? 'var(--poly-accent)' : 'var(--poly-border-muted)',
                      }}
                    />
                    <span className="text-[13px] text-poly-text">{name}</span>
                  </div>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: i === 0 ? 'var(--poly-accent)' : 'var(--poly-muted)' }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity — matching mobile: clickable items, dot + title + meta + time */}
        <div
          className="p-5 border border-poly-border-muted"
          style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '16px' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-poly-text">Recent Activity</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 border border-green-500/25" style={{ borderRadius: '6px' }}>
              <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" style={{ borderRadius: '50%' }} />
              <span className="text-[9px] font-bold tracking-[1px] text-green-500">LIVE</span>
            </div>
          </div>

          {!activities || activities.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <span className="material-symbols-outlined text-[40px] text-poly-border-muted">inbox</span>
              <p className="text-[14px] text-poly-muted mt-3">No activities yet</p>
              <p className="text-[12px] text-poly-muted mt-1">Tap + to add your first entry</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activities.slice(0, 5).map((activity, i) => (
                <Link
                  key={activity.id}
                  href={`/activity-detail?id=${activity.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:opacity-80"
                  style={{
                    borderBottom: i < Math.min(activities.length, 5) - 1 ? '1px solid var(--poly-border-muted)' : 'none',
                  }}
                >
                  <div
                    className="w-2 h-2 shrink-0"
                    style={{
                      borderRadius: '50%',
                      backgroundColor: i === 0 ? 'var(--poly-accent)' : 'var(--poly-border-muted)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-poly-text truncate">{activity.title}</p>
                    <p className="text-[11px] text-poly-muted">
                      {activity.source}{activity.category ? ` · ${activity.category}` : ''}
                    </p>
                  </div>
                  <span className="text-[11px] text-poly-muted shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </Link>
              ))}
              {activities.length > 5 && (
                <Link
                  href="/activities"
                  className="flex items-center justify-center gap-2 pt-4 mt-2 border-t border-poly-border-muted"
                >
                  <span className="text-[13px] font-bold text-poly-accent">View all</span>
                  <span className="material-symbols-outlined text-[16px] text-poly-accent">arrow_forward</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
