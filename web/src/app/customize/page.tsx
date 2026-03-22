'use client';

import { useState, useEffect } from 'react';
import { FontCollection, FONT_COLLECTIONS } from '../../../../shared/preferences';

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
  fontCollection: FontCollection;
  fontScale: number;
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
  fontCollection: 'industrial',
  fontScale: 1,
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
      // Apply font preferences to CSS variables
      applyFontPreferences(next);
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

  // Apply font CSS variables on load and on change
  useEffect(() => {
    if (loaded) applyFontPreferences(preferences);
  }, [loaded]);

  return { preferences, updatePreference, setScreenVisibility, loaded };
}

const FONT_VAR_MAP: Record<string, string> = {
  'dm-sans': 'var(--font-dm-sans)',
  'inter': 'var(--font-inter)',
  'outfit': 'var(--font-outfit)',
  'space-grotesk': 'var(--font-space-grotesk)',
};

const MONO_VAR_MAP: Record<string, string> = {
  'jetbrains-mono': 'var(--font-jetbrains-mono)',
  'space-mono': 'var(--font-space-mono)',
};

function applyFontPreferences(prefs: Preferences) {
  const root = document.documentElement;
  const config = FONT_COLLECTIONS[prefs.fontCollection] || FONT_COLLECTIONS['industrial'];
  root.style.setProperty('--active-font', FONT_VAR_MAP[config.sans] || FONT_VAR_MAP['dm-sans']);
  root.style.setProperty('--active-mono', MONO_VAR_MAP[config.mono] || MONO_VAR_MAP['jetbrains-mono']);
  root.style.setProperty('--font-scale', String(prefs.fontScale));
}

const COLLECTION_OPTIONS: { key: FontCollection; label: string; desc: string; sample: string }[] = [
  { key: 'industrial', label: 'Industrial', desc: 'Tech & System', sample: 'P' },
  { key: 'editorial', label: 'Editorial', desc: 'Reading focus', sample: 'G' },
  { key: 'geometric', label: 'Geometric', desc: 'Modern & Clean', sample: 'a' },
  { key: 'neo-brutalist', label: 'Neo-Brutalist', desc: 'Bold & Raw', sample: 'S' },
];

export default function CustomizePage() {
  const { preferences, updatePreference, setScreenVisibility, loaded } = usePreferences();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
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
      className={`relative flex flex-col items-center p-4 gap-1 rounded-2xl border transition-standard ${
        isActive
          ? 'bg-m3-primary border-m3-primary'
          : 'bg-m3-surface-container border-m3-outline-variant hover:bg-m3-surface-container-high'
      }`}
    >
      <div
        className={`w-9 h-9 flex items-center justify-center mb-1 rounded-xl ${
          isActive ? 'bg-m3-on-primary' : 'bg-m3-surface'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] ${
            isActive ? 'text-m3-primary' : 'text-m3-on-surface-variant'
          }`}
        >
          {icon}
        </span>
      </div>
      <span
        className={`text-[12px] font-semibold ${
          isActive ? 'text-m3-on-primary' : 'text-m3-on-surface'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[9px] text-center opacity-80 ${
          isActive ? 'text-m3-on-primary' : 'text-m3-on-surface-variant'
        }`}
      >
        {desc}
      </span>
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center bg-m3-on-primary rounded-full">
          <span className="material-symbols-outlined text-[12px] text-m3-primary">check</span>
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
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-m3-outline-variant bg-m3-surface-container">
      <div
        className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-xl ${
          enabled ? 'bg-m3-primary-container' : 'bg-m3-surface'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] ${
            enabled ? 'text-m3-on-primary-container' : 'text-m3-on-surface-variant'
          }`}
        >
          {icon}
        </span>
      </div>
      <span className="flex-1 text-[14px] font-medium text-m3-on-surface">{label}</span>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative w-13 h-8 rounded-full transition-standard ${
          enabled ? 'bg-m3-primary' : 'bg-m3-surface-container-highest'
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 rounded-full transition-standard ${
            enabled ? 'bg-m3-on-primary left-6' : 'bg-m3-outline left-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="@container pt-4 flex flex-col gap-5 stagger-children">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">Customize</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">Typography, layout & visibility</p>
      </div>

      {/* ── TYPOGRAPHY ── */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">
          TYPOGRAPHY STYLE
        </p>
        <div className="grid grid-cols-2 @[600px]:grid-cols-4 gap-2">
          {COLLECTION_OPTIONS.map((opt) => {
            const isActive = preferences.fontCollection === opt.key;
            const config = FONT_COLLECTIONS[opt.key];
            const cssVar = FONT_VAR_MAP[config.sans] || '--font-inter';
            return (
              <button
                key={opt.key}
                onClick={() => updatePreference('fontCollection', opt.key as any)}
                className={`relative p-5 rounded-2xl border transition-standard text-left ${
                  isActive
                    ? 'bg-m3-primary border-m3-primary'
                    : 'bg-m3-surface-container border-m3-outline-variant hover:bg-m3-surface-container-high'
                }`}
              >
                <span
                  className={`block text-[32px] font-bold mb-2 leading-none ${
                    isActive ? 'text-m3-on-primary' : 'text-m3-on-surface'
                  }`}
                  style={{ fontFamily: `var(${cssVar})` }}
                >
                  {opt.sample}
                </span>
                <span
                  className={`block text-[14px] font-semibold mb-1 ${
                    isActive ? 'text-m3-on-primary' : 'text-m3-on-surface'
                  }`}
                  style={{ fontFamily: `var(${cssVar})` }}
                >
                  {opt.label}
                </span>
                <span
                  className={`block text-[11px] ${
                    isActive ? 'text-m3-on-primary opacity-80' : 'text-m3-on-surface-variant'
                  }`}
                  style={{ fontFamily: `var(${cssVar})` }}
                >
                  {config.sans} / {config.mono}
                </span>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-m3-on-primary rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-m3-primary">check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide">
            FONT SIZE
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-m3-primary">
              {Math.round(preferences.fontScale * 100)}%
            </span>
            {preferences.fontScale !== 1 && (
              <button
                onClick={() => updatePreference('fontScale', 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard"
              >
                <span className="material-symbols-outlined text-[14px] text-m3-on-surface-variant">restart_alt</span>
              </button>
            )}
          </div>
        </div>
        <div className="px-1">
          <input
            type="range"
            min="0.85"
            max="1.30"
            step="0.05"
            value={preferences.fontScale}
            onChange={(e) => updatePreference('fontScale', parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--m3-primary) 0%, var(--m3-primary) ${((preferences.fontScale - 0.85) / 0.45) * 100}%, var(--m3-surface-container-high) ${((preferences.fontScale - 0.85) / 0.45) * 100}%, var(--m3-surface-container-high) 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-m3-on-surface-variant">A</span>
            <span className="text-[13px] text-m3-on-surface-variant">A</span>
          </div>
        </div>
        <p className="text-[12px] text-m3-on-surface-variant mt-3 px-1 p-3 rounded-2xl bg-m3-surface-container border border-m3-outline-variant" style={{ fontSize: `${preferences.fontScale}rem` }}>
          Preview: This text resizes as you adjust the slider above.
        </p>
      </div>

      {/* Dashboard Layout */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">
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
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">
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
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">
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
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-2 px-1">
          VISIBLE SCREENS
        </p>
        <p className="text-[12px] text-m3-on-surface-variant mb-3 px-1">
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
