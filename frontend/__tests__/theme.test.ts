/**
 * Theme System Tests
 *
 * Tests the M3 theme tokens, palettes, and configuration.
 * T09b: deprecated void/nova/ocean/forest/sunset/midnight identity tests → it.skip
 */

import {
  themes,
  themeNames,
  getNextTheme,
  spacing,
  radii,
  typography,
  themeTokens,
  type ThemeName,
  type ThemeTokens,
} from '../theme/tokens';

describe('Theme System Tests', () => {
  describe('themes object', () => {
    it.skip('deprecated per T09a — void replaced by ink', () => {
      expect(themes.void).toBeDefined();
    });

    it.skip('deprecated per T09a — nova replaced by paper', () => {
      expect(themes.nova).toBeDefined();
    });

    it('should have ink theme', () => {
      expect(themes.ink).toBeDefined();
    });

    it('should have paper theme', () => {
      expect(themes.paper).toBeDefined();
    });

    it('should have dusk theme', () => {
      expect(themes.dusk).toBeDefined();
    });

    it('should have amber theme', () => {
      expect(themes.amber).toBeDefined();
    });

    it('should have 4 active themes', () => {
      expect(themeNames).toHaveLength(4);
    });

    it('should have all active named themes', () => {
      const expected = ['ink', 'paper', 'dusk', 'amber'] as const;
      expected.forEach((name) => {
        expect(themes[name]).toBeDefined();
      });
    });
  });

  describe('getNextTheme', () => {
    it.skip('deprecated per T09a — void→nova cycle removed', () => {
      expect(getNextTheme('void')).toBe('nova');
    });

    it.skip('deprecated per T09a — midnight→void cycle removed', () => {
      expect(getNextTheme('midnight')).toBe('void');
    });

    it('should cycle from ink to paper', () => {
      expect(getNextTheme('ink')).toBe('paper');
    });

    it('should cycle from amber back to ink', () => {
      expect(getNextTheme('amber')).toBe('ink');
    });

    it('should cycle through all 4 active themes', () => {
      let current = getNextTheme('ink');
      const visited = ['ink', current];
      for (let i = 0; i < 3; i++) {
        current = getNextTheme(current);
        visited.push(current);
      }
      expect(visited).toHaveLength(5);
      const unique = [...new Set(visited)];
      expect(unique).toHaveLength(4);
    });

    it('deprecated theme name should cycle to ink (first active)', () => {
      // void is deprecated — idx=-1 → next is themeNames[0] = ink
      expect(getNextTheme('void')).toBe('ink');
      expect(getNextTheme('midnight')).toBe('ink');
    });
  });

  describe('M3 Theme structure', () => {
    themeNames.forEach((themeName) => {
      describe(`${themeName} theme`, () => {
        const theme = themeTokens[themeName];

        it('should have name property matching key', () => {
          expect(theme.name).toBe(themeName);
        });

        it('should have a label', () => {
          expect(theme.label).toBeDefined();
          expect(typeof theme.label).toBe('string');
          expect(theme.label.length).toBeGreaterThan(0);
        });

        // M3 Primary
        it('should have primary colors', () => {
          expect(theme.primary).toBeDefined();
          expect(theme.onPrimary).toBeDefined();
          expect(theme.primaryContainer).toBeDefined();
          expect(theme.onPrimaryContainer).toBeDefined();
        });

        // M3 Surface (tonal elevation ladder)
        it('should have surface tonal ladder', () => {
          expect(theme.surface).toBeDefined();
          expect(theme.surfaceDim).toBeDefined();
          expect(theme.surfaceContainer).toBeDefined();
          expect(theme.surfaceContainerHigh).toBeDefined();
          expect(theme.surfaceContainerHighest).toBeDefined();
          expect(theme.onSurface).toBeDefined();
          expect(theme.onSurfaceVariant).toBeDefined();
        });

        // M3 Outline
        it('should have outline colors', () => {
          expect(theme.outline).toBeDefined();
          expect(theme.outlineVariant).toBeDefined();
        });

        // M3 Inverse
        it('should have inverse colors', () => {
          expect(theme.inverseSurface).toBeDefined();
          expect(theme.inverseOnSurface).toBeDefined();
        });

        // M3 Status
        it('should have status colors', () => {
          expect(theme.error).toBeDefined();
          expect(theme.onError).toBeDefined();
          expect(theme.errorContainer).toBeDefined();
          expect(theme.success).toBeDefined();
          expect(theme.successContainer).toBeDefined();
          expect(theme.warning).toBeDefined();
          expect(theme.warningContainer).toBeDefined();
          expect(theme.info).toBeDefined();
          expect(theme.infoContainer).toBeDefined();
        });

        // Category colors
        it('should have category colors', () => {
          expect(theme.categories).toBeDefined();
          expect(theme.categories.AI).toBeDefined();
          expect(theme.categories.News).toBeDefined();
        });

        // Font references
        it('should have font family references', () => {
          expect(theme.fontDisplay).toBeDefined();
          expect(theme.fontMono).toBeDefined();
        });
      });
    });
  });

  describe('Theme color identity', () => {
    it.skip('deprecated per T09a — void surface identity', () => {
      expect(themes.void.surface).toBe('#000000');
    });

    it.skip('deprecated per T09a — nova surface identity', () => {
      expect(themes.nova.surface).toBe('#FFFFFF');
    });

    it.skip('deprecated per T09a — amber primary identity', () => {
      expect(themes.amber.primary).toBe('#FFB800');
    });

    it.skip('deprecated per T09a — ocean primary identity', () => {
      expect(themes.ocean.primary).toBe('#00F2FF');
    });

    it.skip('deprecated per T09a — void silver primary identity', () => {
      expect(themes.void.primary).toBe('#C0C0C0');
    });

    it('ink theme should have cream surface (light theme)', () => {
      expect(themes.ink.surface).toBe('#FAF8F5');
    });

    it('paper theme should have dark ink surface', () => {
      expect(themes.paper.surface).toBe('#1C1917');
    });

    it('dusk theme should have deep blue-grey surface', () => {
      expect(themes.dusk.surface).toBe('#0F172A');
    });

    it('amber theme should retain its primary', () => {
      expect(themes.amber.primary).toBe('#FFB800');
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

    it('should have full as large number (pill shape)', () => {
      expect(radii.full).toBeGreaterThan(100);
    });

    it('should have xl for cards (28px)', () => {
      expect(radii.xl).toBe(28);
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

    it('should have all M3 type scale variants', () => {
      const m3Variants = [
        'displayLarge', 'displayMedium', 'displaySmall',
        'headlineLarge', 'headlineMedium', 'headlineSmall',
        'titleLarge', 'titleMedium', 'titleSmall',
        'bodyLarge', 'bodyMedium', 'bodySmall',
        'labelLarge', 'labelMedium', 'labelSmall',
      ] as const;

      m3Variants.forEach((variant) => {
        expect(typography[variant]).toBeDefined();
        expect(typography[variant].fontSize).toBeGreaterThan(0);
        expect(typography[variant].lineHeight).toBeGreaterThan(0);
      });
    });

    it('should have font sizes in descending order (display > headline > title > body > label)', () => {
      expect(typography.displayLarge.fontSize).toBeGreaterThan(typography.headlineLarge.fontSize);
      expect(typography.headlineLarge.fontSize).toBeGreaterThan(typography.titleLarge.fontSize);
      expect(typography.titleLarge.fontSize).toBeGreaterThan(typography.bodyLarge.fontSize);
      expect(typography.bodyLarge.fontSize).toBeGreaterThan(typography.labelLarge.fontSize);
    });
  });
});
