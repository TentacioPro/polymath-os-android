'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  const SettingsRow = ({
    icon,
    label,
    href,
    value,
    onClick,
    danger,
  }: {
    icon: string;
    label: string;
    href?: string;
    value?: string | number;
    onClick?: () => void;
    danger?: boolean;
  }) => {
    const content = (
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl transition-standard ${
          danger
            ? 'bg-m3-error-container hover:opacity-90 cursor-pointer'
            : 'bg-m3-surface-container hover:bg-m3-surface-container-high'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            danger ? 'bg-m3-error/20' : 'bg-m3-primary-container'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              danger ? 'text-m3-error' : 'text-m3-on-primary-container'
            }`}
          >
            {icon}
          </span>
        </div>
        <span
          className={`flex-1 text-[14px] font-medium ${
            danger ? 'text-m3-error' : 'text-m3-on-surface'
          }`}
        >
          {label}
        </span>
        {value !== undefined && (
          <span className="text-[13px] font-semibold text-m3-primary">{value}</span>
        )}
        {href && (
          <span className="material-symbols-outlined text-[18px] text-m3-on-surface-variant">chevron_right</span>
        )}
      </div>
    );
    if (href) return <Link href={href} className="block">{content}</Link>;
    return content;
  };

  return (
    <div className="@container pt-4 flex flex-col gap-5 stagger-children">
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">Profile</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">Settings</p>
      </div>

      {/* User / Avatar Card */}
      <div className="flex items-center gap-4 p-5 rounded-3xl bg-m3-surface-container border border-m3-outline-variant">
        <div className="w-14 h-14 rounded-2xl bg-m3-primary flex items-center justify-center shrink-0">
          <span className="text-[22px] font-bold text-m3-on-primary">
            {(user?.display_name || user?.email || 'P').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-m3-on-surface truncate">
            {user?.display_name || persona?.name || 'Polymath User'}
          </p>
          <p className="text-[12px] text-m3-on-surface-variant mt-0.5 truncate">
            {user?.email || persona?.role || 'Knowledge companion'}
          </p>
        </div>
        {isAuthenticated && (
          <div className="px-2 py-1 rounded-full bg-m3-success-container">
            <span className="text-[9px] font-bold text-m3-success tracking-wider">ONLINE</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Data</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="layers" label="Activities" value={stats?.total_activities || 0} />
          <SettingsRow icon="menu_book" label="Journals" value={stats?.total_journals || 0} />
          <SettingsRow icon="hub" label="Connections" value={stats?.total_connections || 0} />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Appearance</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="palette" label="Themes" href="/appearance" />
          <SettingsRow icon="tune" label="Customize" href="/customize" />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">System</p>
        <div className="flex flex-col gap-2">
          <SettingsRow icon="extension" label="Integrations" href="/integrations" />
          <SettingsRow icon="file_download" label="Export Data" href="/export" />
          <SettingsRow icon="bar_chart" label="Analytics" href="/analytics" />
          <SettingsRow icon="info" label="About" value="v1.0" />
        </div>
      </div>

      {/* Account */}
      {isAuthenticated && (
        <div>
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Account</p>
          <div className="flex flex-col gap-2">
            <SettingsRow icon="logout" label="Sign Out" onClick={handleLogout} danger />
          </div>
        </div>
      )}

      {!isAuthenticated && !authLoading && (
        <div>
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">Account</p>
          <Link
            href="/login"
            className="flex items-center gap-3 p-4 rounded-2xl bg-m3-primary-container hover:opacity-90 transition-standard"
          >
            <div className="w-9 h-9 rounded-xl bg-m3-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-m3-primary">login</span>
            </div>
            <span className="flex-1 text-[14px] font-medium text-m3-on-primary-container">Sign In</span>
            <span className="material-symbols-outlined text-[18px] text-m3-on-primary-container">chevron_right</span>
          </Link>
        </div>
      )}
    </div>
  );
}
