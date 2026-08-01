#!/usr/bin/env tsx
/**
 * Token generator — shared/design-tokens.ts → web/src/app/tokens.generated.css
 * Reads the 4 active M3 palettes and emits CSS custom properties per theme.
 * Wired to: web/package.json prebuild + predev scripts.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { m3Themes, themeNames, isDarkTheme } from '../shared/design-tokens';
import type { M3Palette, ThemeName } from '../shared/design-tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = join(__dirname, '../web/src/app/tokens.generated.css');

function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

function paletteToVars(palette: M3Palette): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(palette)) {
    if (key === 'categories') continue;
    lines.push(`  --m3-${camelToKebab(key)}: ${value};`);
  }
  for (const [cat, color] of Object.entries(palette.categories)) {
    lines.push(`  --m3-cat-${cat.toLowerCase()}: ${color};`);
  }
  return lines.join('\n');
}

// Provenance border colors — WCAG AA ≥4.5:1 against each surface type.
// Values verified in 09b-decisions.md §3. Dark-surface themes: paper, dusk, amber.
const PROV_DARK: Record<string, string> = {
  verified_artifact:       '#86EFAC', // 11.8:1 on dark surface
  human_verified:          '#93C5FD', // 8.5:1
  ai_generated_unverified: '#FCD34D', // 11.6:1
  unknown:                 '#CBD5E1', // 11.1:1
};
const PROV_LIGHT: Record<string, string> = {
  verified_artifact:       '#15803D', // 4.8:1 on light surface (#FAF8F5)
  human_verified:          '#1D4ED8', // 6.4:1
  ai_generated_unverified: '#92400E', // 6.0:1
  unknown:                 '#475569', // 7.3:1
};

function provenanceVars(name: ThemeName): string {
  const vars = isDarkTheme(name) ? PROV_DARK : PROV_LIGHT;
  return Object.entries(vars)
    .map(([k, v]) => `  --prov-${k.replace(/_/g, '-')}: ${v};`)
    .join('\n');
}

function themeBlock(name: ThemeName, selector: string): string {
  const palette = m3Themes[name];
  const scheme = isDarkTheme(name) ? 'dark' : 'light';
  return `
/* ═══ THEME: ${name.toUpperCase()} ═══ */
${selector} {
${paletteToVars(palette)}
  /* provenance border colors (WCAG AA ≥4.5:1) */
${provenanceVars(name)}
  color-scheme: ${scheme};
}`;
}

const out = [
  '/* tokens.generated.css — DO NOT EDIT. Run: tsx scripts/generate-tokens.mts */',
  themeBlock('ink',   ':root, .theme-ink'),
  themeBlock('paper', '.theme-paper'),
  themeBlock('dusk',  '.theme-dusk'),
  themeBlock('amber', '.theme-amber'),
].join('\n') + '\n';

writeFileSync(OUTPUT_PATH, out);
console.log(`✓ tokens.generated.css — ${themeNames.length} active themes`);
