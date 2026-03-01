import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, fs, sw, ThemeName, themes, themeNames } from '../theme';
import { hapticLight, hapticPress, hapticSuccess } from '../utils/haptics';

// Theme metadata with display names and variants
const THEME_META: Record<ThemeName, { name: string; variant: 'dark' | 'light'; description: string }> = {
  void: { name: 'Void', variant: 'dark', description: 'Pure black, green accent' },
  nova: { name: 'Nova', variant: 'light', description: 'Clean white, teal accent' },
  amber: { name: 'Amber Void', variant: 'dark', description: 'Black with warm amber' },
  ocean: { name: 'Ocean Depth', variant: 'dark', description: 'Deep blue, calm focus' },
  forest: { name: 'Forest Canopy', variant: 'dark', description: 'Natural green tones' },
  sunset: { name: 'Sunset Blaze', variant: 'dark', description: 'Warm orange glow' },
  midnight: { name: 'Midnight Purple', variant: 'dark', description: 'Rich purple hues' },
};

export default function AppearanceScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

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
      <TouchableOpacity
        style={[
          styles.themeCard,
          {
            backgroundColor: surface,
            borderColor: isActive ? accent : border,
            borderWidth: isActive ? 2 : 1,
          },
        ]}
        onPress={() => handleThemeSelect(name)}
        activeOpacity={0.7}
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: t.background }]}>
          <View style={[styles.previewHeader, { backgroundColor: t.surface }]}>
            <View style={[styles.previewDot, { backgroundColor: t.accent }]} />
            <View style={[styles.previewLine, { backgroundColor: t.textMuted }]} />
          </View>
          <View style={styles.previewBody}>
            <View style={[styles.previewCard, { backgroundColor: t.surface, borderColor: t.borderMuted }]}>
              <View style={[styles.previewAccentLine, { backgroundColor: t.accent }]} />
              <View style={[styles.previewTextLine, { backgroundColor: t.textMuted }]} />
            </View>
          </View>
          <View style={[styles.previewPill, { backgroundColor: t.pill.background, borderColor: t.pill.border }]}>
            <View style={[styles.previewPillDot, { backgroundColor: t.pill.activeColor }]} />
          </View>
        </View>

        {/* Info */}
        <View style={styles.themeInfo}>
          <View style={styles.themeNameRow}>
            <Text style={[styles.themeName, { color: text }]}>{meta.name}</Text>
            {isActive && (
              <View style={[styles.activeBadge, { backgroundColor: accent }]}>
                <MaterialIcons name="check" size={12} color={theme.accentContrast} />
              </View>
            )}
          </View>
          <Text style={[styles.themeDesc, { color: textMuted }]}>{meta.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.iconBtn, { backgroundColor: surface }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={text} />
        </TouchableOpacity>
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
  title: { fontSize: fs(20), fontWeight: '700' },
  subtitle: { fontSize: fs(12), marginTop: 2 },
  iconBtn: {
    width: sw(44),
    height: sw(44),
    borderRadius: sw(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fs(10),
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
    fontSize: fs(10),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  currentName: {
    fontSize: fs(18),
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
    width: '47%',
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
    paddingHorizontal: 6,
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
    paddingTop: 6,
  },
  previewCard: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    padding: 6,
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
    fontSize: fs(14),
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
    fontSize: fs(11),
    marginTop: 4,
  },
});
