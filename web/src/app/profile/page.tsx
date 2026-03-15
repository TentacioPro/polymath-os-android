'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const [persona, setPersona] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPersona().then((r) => r.data).catch(() => null),
      api.getStats().then((r) => r.data).catch(() => null),
    ]).then(([p, s]) => {
      setPersona(p);
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
      </div>
    );
  }

  const SettingsRow = ({
    icon,
    label,
    href,
    value,
  }: {
    icon: string;
    label: string;
    href?: string;
    value?: string | number;
  }) => {
    const content = (
      <div
        className="flex items-center gap-3 p-4 transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '14px' }}
      >
        <span className="material-symbols-outlined text-[20px] text-poly-accent">{icon}</span>
        <span className="flex-1 text-[14px] font-medium text-poly-text">{label}</span>
        {value !== undefined && (
          <span className="text-[13px] font-semibold text-poly-accent">{value}</span>
        )}
        {href && (
          <span className="material-symbols-outlined text-[18px] text-poly-muted">chevron_right</span>
        )}
      </div>
    );
    if (href) return <Link href={href} className="block">{content}</Link>;
    return content;
  };

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Profile</h1>
        <p className="text-[12px] text-poly-muted mt-0.5">Settings</p>
      </div>

      {/* Avatar Card */}
      <div
        className="flex items-center gap-4 p-5 border border-poly-border-muted"
        style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '16px' }}
      >
        <div
          className="w-14 h-14 flex items-center justify-center bg-poly-accent shrink-0"
          style={{ borderRadius: '16px' }}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--poly-accent-text)' }}>person</span>
        </div>
        <div>
          <p className="text-[16px] font-bold text-poly-text">{persona?.name || 'PolymathOS'}</p>
          <p className="text-[12px] text-poly-muted mt-0.5">{persona?.role || 'Knowledge companion'}</p>
        </div>
      </div>

      {/* Data Section */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">DATA</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="layers" label="Activities" value={stats?.total_activities || 0} />
          <SettingsRow icon="menu_book" label="Journals" value={stats?.total_journals || 0} />
          <SettingsRow icon="hub" label="Connections" value={stats?.total_connections || 0} />
        </div>
      </div>

      {/* Appearance Section */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">APPEARANCE</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="palette" label="Themes" href="/appearance" />
          <SettingsRow icon="tune" label="Customize" href="/customize" />
        </div>
      </div>

      {/* System Section */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">SYSTEM</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="extension" label="Integrations" href="/integrations" />
          <SettingsRow icon="file_download" label="Export Data" href="/export" />
          <SettingsRow icon="bar_chart" label="Analytics" href="/analytics" />
          <SettingsRow icon="info" label="About" value="v1.0" />
        </div>
      </div>
    </div>
  );
}
