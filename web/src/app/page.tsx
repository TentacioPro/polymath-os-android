'use client';

import { useStats } from '@/hooks/useStats';
import { useActivities } from '@/hooks/useActivities';
import { useJournals } from '@/hooks/useJournals';
import EngagementWidgets from '@/components/EngagementWidgets';
import Link from 'next/link';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl mode';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Night owl mode';
}

function getDomain(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useStats();
  const { data: activities, isLoading: activitiesLoading } = useActivities(10);
  const { data: journals } = useJournals(100);

  const loading = statsLoading || activitiesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full mx-auto" />
          <p className="text-m3-on-surface-variant mt-4 text-xs tracking-widest uppercase">
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
    /* @container root — lets children query the content-area width, not the viewport */
    <div className="@container pt-4">
      <div className="grid grid-cols-1 @[680px]:grid-cols-12 gap-5 stagger-children">

        {/* ── Row 1: Header (12) ──────────────────────────────── */}
        <div className="@[680px]:col-span-12 flex justify-between items-center px-1">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-m3-on-surface-variant mb-0.5">
              {getGreeting()}
            </p>
            <h1 className="text-[22px] font-bold text-m3-on-surface tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-m3-primary text-m3-on-primary"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
            </Link>
          </div>
        </div>

        {/* ── Row 2a: Quick Actions (12 → 4) ─────────────────── */}
        <div className="@[680px]:col-span-4">
          <div className="grid grid-cols-4 @[680px]:grid-cols-2 gap-2 h-full">
            {[
              { icon: 'add', label: 'Add', href: '/chat', accent: true },
              { icon: 'chat_bubble_outline', label: 'Chat', href: '/chat', accent: false },
              { icon: 'search', label: 'Search', href: '/search', accent: false },
              { icon: 'edit_note', label: 'Journal', href: '/journal', accent: false },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl transition-standard hover:opacity-90 ${
                  action.accent
                    ? 'bg-m3-primary text-m3-on-primary'
                    : 'bg-m3-surface-container text-m3-on-surface hover:bg-m3-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{action.icon}</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Row 2b: Stats Row (12 → 8) ─────────────────────── */}
        <div className="@[680px]:col-span-8">
          <div className="grid grid-cols-3 gap-2 h-full">
            <Link
              href="/activities"
              className="flex flex-col items-center gap-1 py-5 px-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant transition-standard hover:bg-m3-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">layers</span>
              <span className="text-[24px] font-bold text-m3-on-surface">{totalActivities}</span>
              <span className="text-[10px] uppercase tracking-wider text-m3-on-surface-variant">Activities</span>
            </Link>
            <Link
              href="/journal"
              className="flex flex-col items-center gap-1 py-5 px-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant transition-standard hover:bg-m3-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px] text-m3-primary">menu_book</span>
              <span className="text-[24px] font-bold text-m3-on-surface">{totalJournals}</span>
              <span className="text-[10px] uppercase tracking-wider text-m3-on-surface-variant">Journals</span>
            </Link>
            <Link
              href="/connections"
              className="flex flex-col items-center gap-1 py-5 px-3 rounded-2xl bg-m3-primary text-m3-on-primary transition-standard hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[20px]">hub</span>
              <span className="text-[24px] font-bold">{totalConnections}</span>
              <span className="text-[10px] uppercase tracking-wider opacity-80">Mesh</span>
            </Link>
          </div>
        </div>

        {/* ── Row 3a: Engagement Widgets (12 → 5) ────────────── */}
        <div className="@[680px]:col-span-5">
          <EngagementWidgets
            activityTimestamps={(activities || []).map((a) => a.timestamp)}
            journalTimestamps={(journals || []).map((j) => j.timestamp)}
          />
        </div>

        {/* ── Row 3b: Neural Mesh (12 → 7) ───────────────────── */}
        <div className="@[680px]:col-span-7">
          <Link
            href="/connections"
            className="flex flex-col justify-between h-full p-5 rounded-3xl bg-m3-surface-container border border-m3-outline-variant transition-standard hover:bg-m3-surface-container-high"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-m3-on-surface">Neural Mesh</span>
                <div className="w-2 h-2 rounded-full bg-m3-success animate-pulse" />
              </div>
              <span className="material-symbols-outlined text-[20px] text-m3-on-surface-variant">arrow_forward</span>
            </div>
            <p className="text-[13px] text-m3-on-surface-variant leading-[20px] mb-3">
              {totalConnections > 0
                ? `${totalConnections} connections discovered across your knowledge base.`
                : 'Start adding content to discover patterns and connections.'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i % 4 === 0 ? 'animate-pulse bg-m3-primary' : 'bg-m3-outline-variant opacity-50'}`}
                />
              ))}
            </div>
          </Link>
        </div>

        {/* ── Row 4a: Recent Activity (12 → 7 or 12) ─────────── */}
        <div className={`${topCategories.length > 0 ? '@[680px]:col-span-7' : '@[680px]:col-span-12'}`}>
          <div className="p-5 rounded-3xl bg-m3-surface-container border border-m3-outline-variant h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-m3-on-surface">Recent Activity</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-m3-success-container">
                <div className="w-1.5 h-1.5 rounded-full bg-m3-success animate-pulse" />
                <span className="text-[9px] font-bold tracking-wider text-m3-success uppercase">LIVE</span>
              </div>
            </div>

            {!activities || activities.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <span className="material-symbols-outlined text-[40px] text-m3-outline-variant">inbox</span>
                <p className="text-[14px] text-m3-on-surface-variant mt-3">No activities yet</p>
                <p className="text-[12px] text-m3-on-surface-variant mt-1">Tap + to add your first entry</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {activities.slice(0, 5).map((activity, i) => (
                  <Link
                    key={activity.id}
                    href={`/activity-detail?id=${activity.id}`}
                    className="flex items-center gap-3 py-3 transition-standard hover:opacity-80"
                    style={{
                      borderBottom: i < Math.min(activities.length, 5) - 1 ? '1px solid var(--m3-outline-variant)' : 'none',
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? 'bg-m3-primary' : 'bg-m3-outline-variant'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-m3-on-surface truncate">{activity.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-[11px] text-m3-on-surface-variant">
                          {activity.source}{activity.category ? ` · ${activity.category}` : ''}
                        </p>
                        {getDomain(activity.url) && (
                          <span className="text-[9px] text-m3-primary hidden @[400px]:inline">
                            · {getDomain(activity.url)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-m3-on-surface-variant shrink-0">
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
                    className="flex items-center justify-center gap-2 pt-4 mt-2 border-t border-m3-outline-variant"
                  >
                    <span className="text-[13px] font-bold text-m3-primary">View all</span>
                    <span className="material-symbols-outlined text-[16px] text-m3-primary">arrow_forward</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4b: Top Domains (12 → 5) ───────────────────── */}
        {topCategories.length > 0 && (
          <div className="@[680px]:col-span-5">
            <div className="p-5 rounded-3xl bg-m3-surface-container border border-m3-outline-variant h-full">
              <h3 className="text-[14px] font-bold text-m3-on-surface mb-4">Top Domains</h3>
              <div className="flex flex-col">
                {topCategories.map(([name, count]: any, i) => (
                  <div key={name} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-m3-primary' : 'bg-m3-outline-variant'}`} />
                      <span className="text-[13px] text-m3-on-surface">{name}</span>
                    </div>
                    <span className={`text-[13px] font-semibold ${i === 0 ? 'text-m3-primary' : 'text-m3-on-surface-variant'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
