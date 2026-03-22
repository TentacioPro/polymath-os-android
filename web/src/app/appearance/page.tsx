'use client';

import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';
import type { ThemeId } from '@/lib/theme';

// Theme metadata matching mobile appearance.tsx — colors from shared/design-tokens.ts
const THEME_META: Record<string, { colors: { bg: string; surface: string; accent: string; text: string; border: string; secondary: string }; description: string }> = {
  void: {
    colors: { bg: '#0A0A0A', surface: '#151515', accent: '#FFFFFF', text: '#E6E6E6', border: '#2A2A2A', secondary: '#C8BEB4' },
    description: 'Achromatic monochrome, white accent',
  },
  nova: {
    colors: { bg: '#FAFAFA', surface: '#F0F0F0', accent: '#1A1A1A', text: '#1A1A1A', border: '#E0E0E0', secondary: '#6B5E52' },
    description: 'Clean light, minimal dark accent',
  },
  amber: {
    colors: { bg: '#0C0800', surface: '#1A1200', accent: '#FFB800', text: '#F0E0C0', border: '#3D2A00', secondary: '#4DB89A' },
    description: 'Dark void, warm amber accent',
  },
  ocean: {
    colors: { bg: '#080E1A', surface: '#0F1A2E', accent: '#60A5FA', text: '#D6E4F0', border: '#1A3355', secondary: '#DB7A9E' },
    description: 'Deep blue, calm focus',
  },
  forest: {
    colors: { bg: '#060E06', surface: '#0F1E0F', accent: '#34D399', text: '#D0E8D0', border: '#1A401A', secondary: '#A070D4' },
    description: 'Emerald green, nature-inspired',
  },
  sunset: {
    colors: { bg: '#100606', surface: '#1E0E0E', accent: '#FB923C', text: '#F0D0C0', border: '#401E12', secondary: '#48C488' },
    description: 'Warm orange glow',
  },
  midnight: {
    colors: { bg: '#0A061A', surface: '#150E28', accent: '#C084FC', text: '#E0D0F0', border: '#352255', secondary: '#D4A44A' },
    description: 'Deep purple night',
  },
};

function ThemeCard({ themeId, active, onSelect }: { themeId: string; active: boolean; onSelect: () => void }) {
  const meta = THEME_META[themeId];
  const themeInfo = THEMES.find((t) => t.id === themeId);
  if (!meta || !themeInfo) return null;

  const { bg, surface, accent, text, border, secondary } = meta.colors;

  return (
    <button
      onClick={onSelect}
      className="flex flex-col overflow-hidden transition-standard hover:scale-[1.02] rounded-2xl"
      style={{
        border: active ? `2px solid ${accent}` : `1px solid ${border}`,
        backgroundColor: bg,
      }}
    >
      {/* Mini preview — matching mobile ThemeCard */}
      <div className="w-full p-3" style={{ backgroundColor: bg }}>
        {/* Simulated header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: accent }} />
          <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: surface }} />
        </div>
        {/* Simulated card */}
        <div className="p-2 mb-2 rounded-lg" style={{ backgroundColor: surface }}>
          <div className="h-1.5 w-3/4 mb-1 rounded-sm" style={{ backgroundColor: text, opacity: 0.3 }} />
          <div className="h-1.5 w-1/2 rounded-sm" style={{ backgroundColor: text, opacity: 0.15 }} />
        </div>
        {/* Simulated pill */}
        <div className="flex justify-center">
          <div className="h-2 w-16 rounded" style={{ backgroundColor: accent, opacity: 0.6 }} />
        </div>
      </div>
      {/* Live swatch previews */}
      <div className="flex gap-2 px-3 pt-2">
        <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: accent }} />
        <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: surface }} />
        <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: secondary }} />
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

  const darkThemes = ['void', 'amber', 'ocean', 'forest', 'sunset', 'midnight'];
  const lightThemes = ['nova'];

  const currentInfo = THEMES.find((t) => t.id === theme);

  return (
    <div className="@container pt-4 flex flex-col gap-5">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-[20px] font-bold text-m3-on-surface tracking-tight display-kerning">Appearance</h1>
        <p className="text-[12px] text-m3-on-surface-variant mt-0.5">Customize theme</p>
      </div>

      {/* Current Theme Card */}
      <div className="p-4 flex items-center gap-4 rounded-2xl border border-m3-outline-variant bg-m3-surface-container">
        <div className="w-2 h-12 shrink-0 rounded bg-m3-primary" />
        <div className="flex-1">
          <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide">CURRENT THEME</p>
          <p className="text-[16px] font-bold text-m3-on-surface mt-0.5">{currentInfo?.label}</p>
        </div>
        <span className="material-symbols-outlined text-[24px] text-m3-primary">palette</span>
      </div>

      {/* Dark Themes */}
      <div>
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">DARK THEMES</p>
        <div className="grid grid-cols-2 @[600px]:grid-cols-3 gap-3">
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
        <p className="text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-3 px-1">LIGHT THEMES</p>
        <div className="grid grid-cols-2 @[600px]:grid-cols-3 gap-3">
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
