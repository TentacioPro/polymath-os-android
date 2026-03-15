'use client';

import { useState, useEffect } from 'react';

// Layout options matching mobile customize.tsx
const DASHBOARD_LAYOUTS = [
  { value: 'grid', label: 'Grid', desc: 'Card grid with stats', icon: 'grid_view' },
  { value: 'list', label: 'List', desc: 'Vertical feed style', icon: 'view_list' },
  { value: 'compact', label: 'Compact', desc: 'Dense information', icon: 'view_compact' },
];

const PROFILE_LAYOUTS = [
  { value: 'full', label: 'Full', desc: 'All sections visible', icon: 'person' },
  { value: 'minimal', label: 'Minimal', desc: 'Essential info only', icon: 'person_outline' },
];

const SIDEBAR_POSITIONS = [
  { value: 'left', label: 'Left', desc: 'Sidebar on left', icon: 'chevron_right' },
  { value: 'right', label: 'Right', desc: 'Sidebar on right', icon: 'chevron_left' },
  { value: 'hidden', label: 'Hidden', desc: 'No sidebar', icon: 'close' },
];

const SCREENS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'activities', label: 'Activities', icon: 'library_books' },
  { key: 'connections', label: 'Neural Mesh', icon: 'hub' },
  { key: 'journal', label: 'Journal', icon: 'edit' },
  { key: 'chat', label: 'Agent Chat', icon: 'chat' },
  { key: 'analytics', label: 'Analytics', icon: 'analytics' },
  { key: 'integrations', label: 'Integrations', icon: 'extension' },
  { key: 'alerts', label: 'Alerts', icon: 'notifications' },
];

interface Preferences {
  dashboardLayout: 'grid' | 'list' | 'compact';
  profileLayout: 'full' | 'minimal';
  sidebarPosition: 'left' | 'right' | 'hidden';
  visibleScreens: Record<string, boolean>;
}

const DEFAULT_PREFERENCES: Preferences = {
  dashboardLayout: 'grid',
  profileLayout: 'full',
  sidebarPosition: 'left',
  visibleScreens: {
    dashboard: true,
    activities: true,
    connections: true,
    journal: true,
    chat: true,
    analytics: true,
    integrations: true,
    alerts: true,
  },
};

function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('polymath-preferences');
    if (stored) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      } catch {
        // ignore parse errors
      }
    }
    setLoaded(true);
  }, []);

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('polymath-preferences', JSON.stringify(next));
      return next;
    });
  };

  const setScreenVisibility = (screen: string, visible: boolean) => {
    setPreferences((prev) => {
      const next = {
        ...prev,
        visibleScreens: { ...prev.visibleScreens, [screen]: visible },
      };
      localStorage.setItem('polymath-preferences', JSON.stringify(next));
      return next;
    });
  };

  return { preferences, updatePreference, setScreenVisibility, loaded };
}

export default function CustomizePage() {
  const { preferences, updatePreference, setScreenVisibility, loaded } = usePreferences();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-6 h-6 border-2 border-poly-accent border-t-transparent animate-spin"
          style={{ borderRadius: '50%' }}
        />
      </div>
    );
  }

  const LayoutOption = ({
    value,
    label,
    desc,
    icon,
    isActive,
    onSelect,
  }: {
    value: string;
    label: string;
    desc: string;
    icon: string;
    isActive: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className="relative flex flex-col items-center p-4 gap-1 transition-all"
      style={{
        backgroundColor: isActive ? 'var(--poly-accent)' : 'var(--poly-surface)',
        borderRadius: '12px',
        border: isActive ? '1px solid var(--poly-accent)' : '1px solid var(--poly-border-muted)',
        opacity: isActive ? 1 : 0.8,
      }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center mb-1"
        style={{
          backgroundColor: isActive ? 'var(--poly-accent-text)' : 'var(--poly-bg)',
          borderRadius: '10px',
        }}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ color: isActive ? 'var(--poly-accent)' : 'var(--poly-muted)' }}
        >
          {icon}
        </span>
      </div>
      <span
        className="text-[12px] font-semibold"
        style={{ color: isActive ? 'var(--poly-accent-text)' : 'var(--poly-text)' }}
      >
        {label}
      </span>
      <span
        className="text-[9px] text-center"
        style={{ color: isActive ? 'var(--poly-accent-text)' : 'var(--poly-muted)', opacity: 0.8 }}
      >
        {desc}
      </span>
      {isActive && (
        <div
          className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--poly-accent-text)', borderRadius: '50%' }}
        >
          <span className="material-symbols-outlined text-[12px]" style={{ color: 'var(--poly-accent)' }}>
            check
          </span>
        </div>
      )}
    </button>
  );

  const ScreenToggle = ({
    screenKey,
    label,
    icon,
    enabled,
    onToggle,
  }: {
    screenKey: string;
    label: string;
    icon: string;
    enabled: boolean;
    onToggle: (val: boolean) => void;
  }) => (
    <div
      className="flex items-center gap-3 p-3 border border-poly-border-muted"
      style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '12px' }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center shrink-0"
        style={{
          backgroundColor: enabled ? 'var(--poly-accent)' : 'var(--poly-bg)',
          borderRadius: '10px',
          opacity: enabled ? 0.2 : 1,
        }}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ color: enabled ? 'var(--poly-accent)' : 'var(--poly-muted)' }}
        >
          {icon}
        </span>
      </div>
      <span className="flex-1 text-[14px] font-medium text-poly-text">{label}</span>
      <button
        onClick={() => onToggle(!enabled)}
        className="relative w-11 h-6 transition-colors"
        style={{
          backgroundColor: enabled ? 'var(--poly-accent)' : 'var(--poly-border-muted)',
          borderRadius: '12px',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 transition-transform"
          style={{
            backgroundColor: enabled ? 'var(--poly-accent-text)' : 'var(--poly-muted)',
            borderRadius: '50%',
            left: enabled ? 'calc(100% - 22px)' : '2px',
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Customize</h1>
        <p className="text-[12px] text-poly-muted mt-0.5">Layout & visibility</p>
      </div>

      {/* Dashboard Layout */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">
          DASHBOARD LAYOUT
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DASHBOARD_LAYOUTS.map((opt) => (
            <LayoutOption
              key={opt.value}
              {...opt}
              isActive={preferences.dashboardLayout === opt.value}
              onSelect={() => updatePreference('dashboardLayout', opt.value as any)}
            />
          ))}
        </div>
      </div>

      {/* Profile Layout */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">
          PROFILE LAYOUT
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PROFILE_LAYOUTS.map((opt) => (
            <LayoutOption
              key={opt.value}
              {...opt}
              isActive={preferences.profileLayout === opt.value}
              onSelect={() => updatePreference('profileLayout', opt.value as any)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Position */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">
          SIDEBAR POSITION
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SIDEBAR_POSITIONS.map((opt) => (
            <LayoutOption
              key={opt.value}
              {...opt}
              isActive={preferences.sidebarPosition === opt.value}
              onSelect={() => updatePreference('sidebarPosition', opt.value as any)}
            />
          ))}
        </div>
      </div>

      {/* Visible Screens */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-2 px-1">
          VISIBLE SCREENS
        </p>
        <p className="text-[12px] text-poly-muted mb-3 px-1">
          Toggle which screens appear in navigation
        </p>
        <div className="flex flex-col gap-2">
          {SCREENS.map((screen) => (
            <ScreenToggle
              key={screen.key}
              screenKey={screen.key}
              label={screen.label}
              icon={screen.icon}
              enabled={preferences.visibleScreens[screen.key] ?? true}
              onToggle={(val) => setScreenVisibility(screen.key, val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
