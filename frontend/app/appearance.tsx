import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, ThemeName, themes, themeNames } from '../theme';
import { m3Typography, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import { hapticLight, hapticPress, hapticSuccess } from '../utils/haptics';
import { useCardWidth } from '../utils/responsive';

// Theme metadata with display names and variants
const THEME_META: Record<ThemeName, { name: string; variant: 'dark' | 'light'; description: string }> = {
  void: { name: 'Void', variant: 'dark', description: 'Achromatic monochrome, white accent' },
  nova: { name: 'Nova', variant: 'light', description: 'Clean light, minimal dark accent' },
  amber: { name: 'Amber Void', variant: 'dark', description: 'Dark void, warm amber accent' },
  ocean: { name: 'Ocean Depth', variant: 'dark', description: 'Deep blue, calm focus' },
  forest: { name: 'Forest Canopy', variant: 'dark', description: 'Emerald green, nature-inspired' },
  sunset: { name: 'Sunset Blaze', variant: 'dark', description: 'Warm orange glow' },
  midnight: { name: 'Midnight Purple', variant: 'dark', description: 'Deep purple night' },
};

export default function AppearanceScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cardWidth: themeCardWidth } = useCardWidth(2);

  // Colors — M3 token mapping
  const bg = theme.surface;                    // M3: base background
  const surface = theme.surfaceContainerHigh;  // M3: elevated card/surface
  const text = theme.onSurface;
  const textMuted = theme.onSurfaceVariant;
  const accent = theme.primary;
  const border = theme.outlineVariant;

  const handleThemeSelect = (name: ThemeName) => {
    hapticSuccess();
    setTheme(name);
  };

  const darkThemes = themeNames.filter((t) => THEME_META[t].variant === 'dark');
  const lightThemes = themeNames.filter((t) => THEME_META[t].variant === 'light');

  const ThemeCard = ({ name }: { name: ThemeName }) => {
    const t = themes[name];
    const meta = THEME_META[name];
    const isActive = themeName === name;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.themeCard,
          {
            backgroundColor: surface,
            borderColor: isActive ? accent : border,
            borderWidth: isActive ? 2 : 1,
            opacity: pressed ? 0.8 : 1,
            width: themeCardWidth,
          },
        ]}
        onPress={() => handleThemeSelect(name)}
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: t.surface }]}>
          <View style={[styles.previewHeader, { backgroundColor: t.surfaceContainerHigh }]}>
            <View style={[styles.previewDot, { backgroundColor: t.primary }]} />
            <View style={[styles.previewLine, { backgroundColor: t.onSurfaceVariant }]} />
          </View>
          <View style={styles.previewBody}>
            <View style={[styles.previewCard, { backgroundColor: t.surfaceContainer, borderColor: t.outlineVariant }]}>
              <View style={[styles.previewAccentLine, { backgroundColor: t.primary }]} />
              <View style={[styles.previewTextLine, { backgroundColor: t.onSurfaceVariant }]} />
            </View>
          </View>
          <View style={[styles.previewPill, { backgroundColor: t.primaryContainer, borderColor: t.outline }]}>
            <View style={[styles.previewPillDot, { backgroundColor: t.primary }]} />
          </View>
        </View>

        {/* Live swatch previews */}
        <View style={styles.swatchRow}>
          <View style={[styles.swatchDot, { backgroundColor: t.primary }]} />
          <View style={[styles.swatchDot, { backgroundColor: t.surface }]} />
          <View style={[styles.swatchDot, { backgroundColor: t.secondary }]} />
        </View>

        {/* Info */}
        <View style={styles.themeInfo}>
          <View style={styles.themeNameRow}>
            <Text style={[styles.themeName, { color: text }]}>{meta.name}</Text>
            {isActive && (
              <View style={[styles.activeBadge, { backgroundColor: accent }]}>
                <MaterialIcons name="check" size={12} color={theme.onPrimary} />
              </View>
            )}
          </View>
          <Text style={[styles.themeDesc, { color: textMuted }]}>{meta.description}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => { hapticLight(); router.back(); }}
          style={({ pressed }) => [styles.iconBtn, { backgroundColor: surface, opacity: pressed ? 0.8 : 1 }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: text }]}>Appearance</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Customize theme</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Theme */}
        <View style={[styles.currentCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={[styles.currentAccent, { backgroundColor: accent }]} />
          <View style={styles.currentInfo}>
            <Text style={[styles.currentLabel, { color: textMuted }]}>CURRENT THEME</Text>
            <Text style={[styles.currentName, { color: text }]}>{THEME_META[themeName].name}</Text>
          </View>
          <MaterialIcons name="palette" size={24} color={accent} />
        </View>

        {/* Dark Themes */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>DARK THEMES</Text>
        <View style={styles.themeGrid}>
          {darkThemes.map((name) => (
            <ThemeCard key={name} name={name} />
          ))}
        </View>

        {/* Light Themes */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>LIGHT THEMES</Text>
        <View style={styles.themeGrid}>
          {lightThemes.map((name) => (
            <ThemeCard key={name} name={name} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  title: { fontSize: m3Typography.titleLarge.fontSize, fontWeight: '700' },
  subtitle: { fontSize: m3Typography.bodySmall.fontSize, marginTop: 2 },
  iconBtn: {
    width: m3TouchTarget.min,
    height: m3TouchTarget.min,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  /* Current Theme */
  currentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
  },
  currentAccent: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  currentInfo: { flex: 1 },
  currentLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  currentName: {
    fontSize: m3Typography.titleMedium.fontSize,
    fontWeight: '700',
    marginTop: 4,
  },

  /* Theme Grid */
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  themeCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },

  /* Preview */
  preview: {
    height: 100,
    padding: 8,
  },
  previewHeader: {
    height: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewLine: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.3,
  },
  previewBody: {
    flex: 1,
    paddingTop: 8,
  },
  previewCard: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  previewAccentLine: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  previewTextLine: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.5,
  },
  previewPill: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    height: 12,
    width: 50,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* Swatch Previews */
  swatchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  /* Theme Info */
  themeInfo: {
    padding: spacing.md,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeName: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '600',
  },
  activeBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeDesc: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 4,
  },
});
