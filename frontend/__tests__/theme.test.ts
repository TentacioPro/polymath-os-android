/**
 * Theme System Tests
 * 
 * Tests the theme tokens and configuration.
 */

import {
  themes,
  themeNames,
  getNextTheme,
  spacing,
  radii,
  typography,
  type ThemeName,
  type ThemeTokens,
} from '../theme/tokens';

describe('Theme System Tests', () => {
  describe('themes object', () => {
    it('should have void theme', () => {
      expect(themes.void).toBeDefined();
    });

    it('should have nova theme', () => {
      expect(themes.nova).toBeDefined();
    });

    it('should have amber theme', () => {
      expect(themes.amber).toBeDefined();
    });

    it('should have 7 themes total', () => {
      expect(Object.keys(themes)).toHaveLength(7);
    });

    it('should have all named themes', () => {
      const expected: ThemeName[] = ['void', 'nova', 'amber', 'ocean', 'forest', 'sunset', 'midnight'];
      expected.forEach((name) => {
        expect(themes[name]).toBeDefined();
      });
    });
  });

  describe('getNextTheme', () => {
    it('should cycle from void to nova', () => {
      expect(getNextTheme('void')).toBe('nova');
    });

    it('should cycle from midnight back to void', () => {
      expect(getNextTheme('midnight')).toBe('void');
    });

    it('should cycle through all themes', () => {
      let current: ThemeName = 'void';
      const visited: ThemeName[] = [current];
      for (let i = 0; i < 6; i++) {
        current = getNextTheme(current);
        visited.push(current);
      }
      expect(visited).toHaveLength(7);
      expect(new Set(visited).size).toBe(7);
    });
  });

  describe('Theme structure', () => {
    themeNames.forEach((themeName) => {
      describe(`${themeName} theme`, () => {
        const theme: ThemeTokens = themes[themeName];

        it('should have name property matching key', () => {
          expect(theme.name).toBe(themeName);
        });

        it('should have a label', () => {
          expect(theme.label).toBeDefined();
          expect(typeof theme.label).toBe('string');
          expect(theme.label.length).toBeGreaterThan(0);
        });

        it('should have background color', () => {
          expect(theme.background).toBeDefined();
          expect(typeof theme.background).toBe('string');
        });

        it('should have surface color', () => {
          expect(theme.surface).toBeDefined();
        });

        it('should have text colors', () => {
          expect(theme.textPrimary).toBeDefined();
          expect(theme.textSecondary).toBeDefined();
          expect(theme.textMuted).toBeDefined();
        });

        it('should have accent color', () => {
          expect(theme.accent).toBeDefined();
          expect(theme.accentContrast).toBeDefined();
        });

        it('should have border colors', () => {
          expect(theme.border).toBeDefined();
          expect(theme.borderMuted).toBeDefined();
        });

        it('should have drawer config', () => {
          expect(theme.drawer).toBeDefined();
          expect(theme.drawer.background).toBeDefined();
          expect(theme.drawer.textPrimary).toBeDefined();
        });

        it('should have pill nav config', () => {
          expect(theme.pill).toBeDefined();
          expect(theme.pill.background).toBeDefined();
          expect(theme.pill.activeColor).toBeDefined();
        });

        it('should have status colors', () => {
          expect(theme.status).toBeDefined();
          expect(theme.status.success).toBeDefined();
          expect(theme.status.error).toBeDefined();
          expect(theme.status.warning).toBeDefined();
          expect(theme.status.info).toBeDefined();
        });

        it('should have category colors', () => {
          expect(theme.categories).toBeDefined();
          expect(theme.categories.AI).toBeDefined();
        });
      });
    });
  });

  describe('Theme colors contrast', () => {
    it('void theme should have dark background', () => {
      expect(themes.void.background).toBe('#000000');
    });

    it('nova theme should have light background', () => {
      expect(themes.nova.background).toBe('#FFFFFF');
    });

    it('amber theme should have dark background with amber accent', () => {
      expect(themes.amber.background).toBe('#000000');
      expect(themes.amber.accent).toMatch(/#FF/i);
    });
  });

  describe('Spacing constants', () => {
    it('should have xs spacing', () => {
      expect(spacing.xs).toBeDefined();
      expect(typeof spacing.xs).toBe('number');
    });

    it('should have sm spacing', () => {
      expect(spacing.sm).toBeDefined();
    });

    it('should have md spacing', () => {
      expect(spacing.md).toBeDefined();
    });

    it('should have lg spacing', () => {
      expect(spacing.lg).toBeDefined();
    });

    it('should have spacing in ascending order', () => {
      expect(spacing.xs).toBeLessThan(spacing.sm);
      expect(spacing.sm).toBeLessThan(spacing.md);
      expect(spacing.md).toBeLessThan(spacing.lg);
    });
  });

  describe('Radii constants', () => {
    it('should have none as 0', () => {
      expect(radii.none).toBe(0);
    });

    it('should have pill as large number', () => {
      expect(radii.pill).toBeGreaterThan(100);
    });
  });

  describe('Typography constants', () => {
    it('should have display style', () => {
      expect(typography.display.fontSize).toBeGreaterThan(20);
    });

    it('should have body style', () => {
      expect(typography.body.fontSize).toBeGreaterThan(10);
    });

    it('should have caption style', () => {
      expect(typography.caption.fontSize).toBeLessThan(typography.body.fontSize);
    });
  });
});
