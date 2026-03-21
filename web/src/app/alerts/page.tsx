'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ALERT_CONFIG: Record<string, { icon: string; colorClass: string }> = {
  success: { icon: 'check_circle', colorClass: 'text-m3-success' },
  warning: { icon: 'warning', colorClass: 'text-m3-warning' },
  info: { icon: 'info', colorClass: 'text-m3-primary' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications(20);
      setAlerts(res.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight">Alerts</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">{alerts.length} notification{alerts.length !== 1 ? 's' : ''}</p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState variant="empty-alerts" />
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
            return (
              <div
                key={alert.id || i}
                className="flex items-start gap-3 p-4 rounded-2xl bg-m3-surface-container border border-m3-outline-variant"
              >
                <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${config.colorClass}`}>
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-m3-on-surface">{alert.title}</p>
                  {alert.description && (
                    <p className="text-[12px] text-m3-on-surface-variant mt-0.5">{alert.description}</p>
                  )}
                </div>
                <span className="text-[11px] text-m3-on-surface-variant shrink-0">
                  {alert.timestamp ? timeAgo(alert.timestamp) : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
