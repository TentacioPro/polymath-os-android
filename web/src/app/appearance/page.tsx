'use client';

import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';
import type { ThemeId } from '@/lib/theme';

// Theme metadata matching mobile appearance.tsx
const THEME_META: Record<string, { colors: { bg: string; surface: string; accent: string; text: string; border: string }; description: string }> = {
  black: {
    colors: { bg: '#000000', surface: '#111111', accent: '#FFFFFF', text: '#FFFFFF', border: '#222222' },
    description: 'Pure darkness',
  },
  nova: {
    colors: { bg: '#FFFFFF', surface: '#F5F5F5', accent: '#000000', text: '#000000', border: '#E5E5E5' },
    description: 'Clean light',
  },
  amber: {
    colors: { bg: '#000000', surface: '#111111', accent: '#FFB800', text: '#FFFFFF', border: '#1A1A1A' },
    description: 'Golden void',
  },
  ocean: {
    colors: { bg: '#0A1628', surface: '#0F1D32', accent: '#3B82F6', text: '#E2E8F0', border: '#1E293B' },
    description: 'Deep waters',
  },
  forest: {
    colors: { bg: '#0A1A0A', surface: '#0F1D0F', accent: '#10B981', text: '#D1FAE5', border: '#1A2E1A' },
    description: 'Living canopy',
  },
  sunset: {
    colors: { bg: '#1A0A0A', surface: '#1F0F0F', accent: '#F97316', text: '#FED7AA', border: '#2E1A1A' },
    description: 'Burning sky',
  },
  midnight: {
    colors: { bg: '#0F0A1A', surface: '#140F1F', accent: '#A855F7', text: '#E9D5FF', border: '#1E1A2E' },
    description: 'Purple haze',
  },
};

function ThemeCard({ themeId, active, onSelect }: { themeId: string; active: boolean; onSelect: () => void }) {
  const meta = THEME_META[themeId];
  const themeInfo = THEMES.find((t) => t.id === themeId);
  if (!meta || !themeInfo) return null;

  const { bg, surface, accent, text, border } = meta.colors;

  return (
    <button
      onClick={onSelect}
      className="flex flex-col overflow-hidden transition-transform hover:scale-[1.02]"
      style={{
        borderRadius: '14px',
        border: active ? `2px solid ${accent}` : `1px solid ${border}`,
        backgroundColor: bg,
      }}
    >
      {/* Mini preview — matching mobile ThemeCard */}
      <div className="w-full p-3" style={{ backgroundColor: bg }}>
        {/* Simulated header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4" style={{ backgroundColor: accent, borderRadius: '4px' }} />
          <div className="h-2 flex-1" style={{ backgroundColor: surface, borderRadius: '2px' }} />
        </div>
        {/* Simulated card */}
        <div className="p-2 mb-2" style={{ backgroundColor: surface, borderRadius: '6px' }}>
          <div className="h-1.5 w-3/4 mb-1" style={{ backgroundColor: text, opacity: 0.3, borderRadius: '1px' }} />
          <div className="h-1.5 w-1/2" style={{ backgroundColor: text, opacity: 0.15, borderRadius: '1px' }} />
        </div>
        {/* Simulated pill */}
        <div className="flex justify-center">
          <div className="h-2 w-16" style={{ backgroundColor: accent, borderRadius: '4px', opacity: 0.6 }} />
        </div>
      </div>
      {/* Label */}
      <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${border}` }}>
        <div>
          <p className="text-[13px] font-semibold text-left" style={{ color: text }}>{themeInfo.label}</p>
          <p className="text-[10px] text-left" style={{ color: text, opacity: 0.5 }}>{meta.description}</p>
        </div>
        {active && (
          <span className="material-symbols-outlined text-[18px]" style={{ color: accent }}>check_circle</span>
        )}
      </div>
    </button>
  );
}

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  const darkThemes = ['black', 'amber', 'ocean', 'forest', 'sunset', 'midnight'];
  const lightThemes = ['nova'];

  const currentMeta = THEME_META[theme];
  const currentInfo = THEMES.find((t) => t.id === theme);

  return (
    <div className="pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-poly-text tracking-tight">Appearance</h1>
        <p className="text-[12px] text-poly-muted mt-0.5">Customize theme</p>
      </div>

      {/* Current Theme Card */}
      <div
        className="p-4 flex items-center gap-4 border border-poly-border-muted"
        style={{ backgroundColor: 'var(--poly-surface)', borderRadius: '16px' }}
      >
        <div className="w-2 h-12 shrink-0" style={{ backgroundColor: 'var(--poly-accent)', borderRadius: '4px' }} />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px]">CURRENT THEME</p>
          <p className="text-[16px] font-bold text-poly-text mt-0.5">{currentInfo?.label}</p>
        </div>
        <span className="material-symbols-outlined text-[24px] text-poly-accent">palette</span>
      </div>

      {/* Dark Themes */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">DARK THEMES</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {darkThemes.map((id) => (
            <ThemeCard
              key={id}
              themeId={id}
              active={theme === id}
              onSelect={() => setTheme(id as ThemeId)}
            />
          ))}
        </div>
      </div>

      {/* Light Themes */}
      <div>
        <p className="text-[10px] font-bold text-poly-muted uppercase tracking-[2px] mb-3 px-1">LIGHT THEMES</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {lightThemes.map((id) => (
            <ThemeCard
              key={id}
              themeId={id}
              active={theme === id}
              onSelect={() => setTheme(id as ThemeId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
