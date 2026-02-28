'use client';

import { useStats } from '@/hooks/useStats';
import { useActivities } from '@/hooks/useActivities';
import { FileText, BookOpen, GitBranch, RefreshCw } from 'lucide-react';
import { getCategoryColor } from '@/lib/constants';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useStats();
  const { data: activities, isLoading: activitiesLoading } = useActivities(10);

  const loading = statsLoading || activitiesLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-poly-indigo border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-poly-light mt-4 text-base">Loading your polymath journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-poly-text">Polymath OS</h1>
        <p className="text-base text-poly-muted mt-1">Track, Learn, Connect</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-poly-card border border-poly-border rounded-2xl p-4 flex flex-col items-center">
          <FileText size={32} className="text-poly-indigo" />
          <span className="text-[28px] font-bold text-poly-text mt-2">
            {stats?.total_activities || 0}
          </span>
          <span className="text-xs text-poly-muted mt-1">Activities</span>
        </div>
        <div className="bg-poly-card border border-poly-border rounded-2xl p-4 flex flex-col items-center">
          <BookOpen size={32} className="text-poly-green" />
          <span className="text-[28px] font-bold text-poly-text mt-2">
            {stats?.total_journals || 0}
          </span>
          <span className="text-xs text-poly-muted mt-1">Journals</span>
        </div>
        <div className="bg-poly-card border border-poly-border rounded-2xl p-4 flex flex-col items-center">
          <GitBranch size={32} className="text-poly-amber" />
          <span className="text-[28px] font-bold text-poly-text mt-2">
            {stats?.total_connections || 0}
          </span>
          <span className="text-xs text-poly-muted mt-1">Connections</span>
        </div>
      </div>

      {/* Category Distribution */}
      {stats?.categories && Object.keys(stats.categories).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-poly-text mb-3">Learning Categories</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center bg-poly-card border border-poly-border rounded-full py-2 px-4"
              >
                <span className="text-sm text-poly-light mr-2">{category}</span>
                <span
                  className="text-xs font-bold text-white rounded-full min-w-[24px] h-6 flex items-center justify-center px-1.5"
                  style={{ backgroundColor: '#6366f1' }}
                >
                  {count as number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {activities && activities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-poly-text mb-3">Recent Learning</h2>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="bg-poly-card border border-poly-border rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-poly-text flex-1 mr-2 line-clamp-2">
                    {activity.title}
                  </h3>
                  <span
                    className="text-[10px] font-bold text-white px-2 py-1 rounded-md shrink-0"
                    style={{ backgroundColor: getCategoryColor(activity.category || 'Other') }}
                  >
                    {activity.category || 'Other'}
                  </span>
                </div>
                <p className="text-xs text-poly-muted">
                  {new Date(activity.timestamp).toLocaleDateString()} • {activity.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-poly-text mb-3">Quick Actions</h2>
        <button
          onClick={() => refetch()}
          className="bg-poly-indigo rounded-xl px-4 py-4 flex items-center justify-center gap-2 w-full hover:bg-poly-indigo/90 transition-colors"
        >
          <RefreshCw size={20} className="text-white" />
          <span className="text-white text-base font-semibold">Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
