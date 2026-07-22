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

function themeBlock(name: ThemeName, selector: string): string {
  const palette = m3Themes[name];
  const scheme = isDarkTheme(name) ? 'dark' : 'light';
  return `
/* ═══ THEME: ${name.toUpperCase()} ═══ */
${selector} {
${paletteToVars(palette)}
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
