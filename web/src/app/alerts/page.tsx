'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

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

const ALERT_CONFIG: Record<string, { icon: string; color: string }> = {
  success: { icon: 'check_circle', color: '#22C55E' },
  warning: { icon: 'warning', color: '#F59E0B' },
  info: { icon: 'info', color: 'var(--poly-accent)' },
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
        <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Alerts</h1>
        <p className="text-[12px] text-poly-muted mt-0.5">{alerts.length} notification{alerts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <span className="material-symbols-outlined text-[48px] text-poly-border-muted">notifications_none</span>
          <p className="text-[14px] text-poly-muted mt-3">No notifications</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
            return (
              <div
                key={alert.id || i}
                className="flex items-start gap-3 p-4 border border-poly-border-muted"
                style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
              >
                <span
                  className="material-symbols-outlined text-[22px] shrink-0 mt-0.5"
                  style={{ color: config.color }}
                >
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-poly-text">{alert.title}</p>
                  {alert.description && (
                    <p className="text-[12px] text-poly-muted mt-0.5">{alert.description}</p>
                  )}
                </div>
                <span className="text-[11px] text-poly-muted shrink-0">
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
