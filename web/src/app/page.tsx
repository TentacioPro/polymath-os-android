'use client';

import { useStats } from '@/hooks/useStats';
import { useActivities } from '@/hooks/useActivities';
import { getCategoryColor } from '@/lib/constants';

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

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Title Section */}
      <div className="flex justify-between items-end px-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-poly-text uppercase tracking-tight">
            Polymath OS
          </h1>
          <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
            System // Dashboard
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-8 h-8 flex items-center justify-center border border-poly-border hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
        </button>
      </div>

      {/* Bento Stats Grid — 3 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-poly-border bg-poly-surface p-4 flex flex-col items-center architect-shadow-sm lg:col-span-2">
          <span className="material-symbols-outlined text-[28px] text-poly-accent mb-2">
            description
          </span>
          <span className="text-2xl font-display font-bold text-poly-text">
            {stats?.total_activities || 0}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-poly-muted mt-1">
            Activities
          </span>
        </div>
        <div className="border border-poly-border bg-poly-surface p-4 flex flex-col items-center architect-shadow-sm lg:col-span-2">
          <span className="material-symbols-outlined text-[28px] text-poly-accent mb-2">
            menu_book
          </span>
          <span className="text-2xl font-display font-bold text-poly-text">
            {stats?.total_journals || 0}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-poly-muted mt-1">
            Journals
          </span>
        </div>
        <div className="border border-poly-border bg-poly-surface p-4 flex flex-col items-center architect-shadow-sm lg:col-span-2">
          <span className="material-symbols-outlined text-[28px] text-poly-accent mb-2">
            hub
          </span>
          <span className="text-2xl font-display font-bold text-poly-text">
            {stats?.total_connections || 0}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-poly-muted mt-1">
            Connections
          </span>
        </div>
      </div>

      {/* Mid section: Topics + Recent side by side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {stats?.categories && Object.keys(stats.categories).length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-poly-text">
                Topic Distribution
              </h3>
              <span className="text-[10px] font-mono text-poly-muted">
                {Object.keys(stats.categories).length} DOMAINS
              </span>
            </div>
            <div className="border border-poly-border bg-poly-surface p-4 flex-1">
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div
                    key={category}
                    className="flex items-center border border-poly-border-muted py-1.5 px-3 gap-2"
                  >
                    <span
                      className="w-2 h-2 shrink-0"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span className="text-xs font-mono text-poly-text uppercase">
                      {category}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-poly-accent">
                      {count as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {activities && activities.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-sm font-mono uppercase tracking-widest font-bold text-poly-text">
                Recent Learning
              </h3>
              <span className="text-[10px] font-mono text-poly-muted">
                LAST {Math.min(5, activities.length)}
              </span>
            </div>
            <div className="flex flex-col gap-0">
              {activities.slice(0, 5).map((activity, idx) => (
                <div
                  key={activity.id}
                  className={`border border-poly-border bg-poly-surface p-4 ${
                    idx > 0 ? '-mt-px' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-display font-bold text-poly-text flex-1 mr-3 uppercase line-clamp-1">
                      {activity.title}
                    </h4>
                    <span
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase shrink-0"
                      style={{
                        backgroundColor: getCategoryColor(activity.category || 'Other'),
                        color: '#FFFFFF',
                      }}
                    >
                      {activity.category || 'Other'}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-poly-muted">
                    {new Date(activity.timestamp).toLocaleDateString()} &middot;{' '}
                    {activity.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="border border-poly-border bg-poly-surface p-4 architect-shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-poly-muted">
            System Integrity
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-poly-green" style={{ borderRadius: '50%' }} />
            <span className="text-[10px] font-mono text-poly-green font-bold">
              OPERATIONAL
            </span>
          </div>
        </div>
        <div className="h-1 bg-poly-border-muted overflow-hidden">
          <div className="h-full bg-poly-accent" style={{ width: '92%' }} />
        </div>
      </div>
    </div>
  );
}
