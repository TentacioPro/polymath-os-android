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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, spacing } from '../theme';
import { m3Typography, m3Radii, resolveFonts, resolveMonoFont } from '../../shared/design-tokens';
import type { FontFamilyPref, MonoFontPref } from '../../shared/design-tokens';
import { useStore } from '../store/useStore';
import M3Switch from '../components/ui/M3Switch';
import { hapticLight, hapticSuccess, hapticSelection } from '../utils/haptics';

const DASHBOARD_LAYOUTS = [
  { value: 'grid', label: 'Grid', desc: 'Card grid with stats', icon: 'grid-view' as const },
  { value: 'list', label: 'List', desc: 'Vertical feed style', icon: 'view-list' as const },
  { value: 'compact', label: 'Compact', desc: 'Dense information', icon: 'view-compact' as const },
];

const PROFILE_LAYOUTS = [
  { value: 'full', label: 'Full', desc: 'All sections visible', icon: 'person' as const },
  { value: 'minimal', label: 'Minimal', desc: 'Essential info only', icon: 'person-outline' as const },
];

const FONT_OPTIONS: { value: FontFamilyPref; label: string; sample: string }[] = [
  { value: 'dm-sans', label: 'DM Sans', sample: 'The quick brown fox' },
  { value: 'inter', label: 'Inter', sample: 'The quick brown fox' },
  { value: 'outfit', label: 'Outfit', sample: 'The quick brown fox' },
  { value: 'space-grotesk', label: 'Space Grotesk', sample: 'The quick brown fox' },
];

const MONO_OPTIONS: { value: MonoFontPref; label: string; sample: string }[] = [
  { value: 'jetbrains-mono', label: 'JetBrains Mono', sample: 'const x = 42;' },
  { value: 'space-mono', label: 'Space Mono', sample: 'const x = 42;' },
];

const FONT_SIZES: { value: number; label: string }[] = [
  { value: 0.85, label: 'S' },
  { value: 0.92, label: 'M' },
  { value: 1.0, label: 'Default' },
  { value: 1.10, label: 'L' },
  { value: 1.20, label: 'XL' },
  { value: 1.30, label: '2XL' },
];

const SCREENS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' as const },
  { key: 'knowledge', label: 'Knowledge', icon: 'library-books' as const },
  { key: 'mesh', label: 'Neural Mesh', icon: 'hub' as const },
  { key: 'journal', label: 'Journal', icon: 'edit' as const },
  { key: 'chat', label: 'Agent Chat', icon: 'chat' as const },
  { key: 'analytics', label: 'Analytics', icon: 'analytics' as const },
  { key: 'integrations', label: 'Integrations', icon: 'extension' as const },
  { key: 'alerts', label: 'Alerts', icon: 'notifications' as const },
] as const;

export default function CustomizeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { preferences, setPreference, setScreenVisibility } = useStore();

  const LayoutOption = ({
    label,
    desc,
    icon,
    isActive,
    onPress,
  }: {
    label: string;
    desc: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.layoutOption,
        {
          backgroundColor: isActive ? theme.primaryContainer : theme.surfaceContainer,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.layoutIcon, {
        backgroundColor: isActive ? theme.primary : theme.surfaceContainerHigh,
      }]}>
        <MaterialIcons
          name={icon}
          size={18}
          color={isActive ? theme.onPrimary : theme.onSurfaceVariant}
        />
      </View>
      <Text style={[styles.layoutLabel, {
        color: isActive ? theme.onPrimaryContainer : theme.onSurface,
      }]}>
        {label}
      </Text>
      <Text style={[styles.layoutDesc, {
        color: isActive ? theme.onPrimaryContainer : theme.onSurfaceVariant,
      }]}>
        {desc}
      </Text>
      {isActive && (
        <View style={[styles.activeCheck, { backgroundColor: theme.primary }]}>
          <MaterialIcons name="check" size={12} color={theme.onPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const ScreenToggle = ({
    label,
    icon,
    enabled,
    onToggle,
  }: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    enabled: boolean;
    onToggle: (val: boolean) => void;
  }) => (
    <View style={[styles.toggleRow, { backgroundColor: theme.surfaceContainer }]}>
      <View style={[styles.toggleIcon, {
        backgroundColor: enabled ? theme.primaryContainer : theme.surfaceContainerHigh,
      }]}>
        <MaterialIcons name={icon} size={18} color={enabled ? theme.onPrimaryContainer : theme.onSurfaceVariant} />
      </View>
      <Text style={[styles.toggleLabel, { color: theme.onSurface }]}>{label}</Text>
      <M3Switch
        value={enabled}
        onValueChange={(val) => {
          hapticSelection();
          onToggle(val);
        }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.backBtn, { backgroundColor: theme.surfaceContainerHigh }]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: theme.onSurface }]}>Customize</Text>
          <Text style={[styles.headerSub, { color: theme.onSurfaceVariant }]}>Layout & visibility</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Typography */}
        <Animated.View entering={FadeInDown.delay(50)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Typography</Text>

          {/* Font Family */}
          <Text style={[styles.subsectionLabel, { color: theme.onSurfaceVariant }]}>Font Family</Text>
          <View style={styles.fontGrid}>
            {FONT_OPTIONS.map((opt) => {
              const isActive = preferences.fontFamily === opt.value;
              const resolved = resolveFonts(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.fontCard,
                    { backgroundColor: isActive ? theme.primaryContainer : theme.surfaceContainer },
                  ]}
                  onPress={() => { hapticSelection(); setPreference('fontFamily', opt.value); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.fontSample,
                    { color: isActive ? theme.onPrimaryContainer : theme.onSurface, fontFamily: resolved.regular },
                  ]}>
                    {opt.sample}
                  </Text>
                  <Text style={[
                    styles.fontName,
                    { color: isActive ? theme.onPrimaryContainer : theme.onSurfaceVariant, fontFamily: resolved.medium },
                  ]}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeCheck, { backgroundColor: theme.primary }]}>
                      <MaterialIcons name="check" size={12} color={theme.onPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Monospace Font */}
          <Text style={[styles.subsectionLabel, { color: theme.onSurfaceVariant, marginTop: spacing.lg }]}>Monospace Font</Text>
          <View style={styles.monoGrid}>
            {MONO_OPTIONS.map((opt) => {
              const isActive = preferences.monoFont === opt.value;
              const resolved = resolveMonoFont(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.fontCard,
                    { flex: 1, backgroundColor: isActive ? theme.primaryContainer : theme.surfaceContainer },
                  ]}
                  onPress={() => { hapticSelection(); setPreference('monoFont', opt.value); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.monoSample,
                    { color: isActive ? theme.onPrimaryContainer : theme.onSurface, fontFamily: resolved.regular },
                  ]}>
                    {opt.sample}
                  </Text>
                  <Text style={[
                    styles.fontName,
                    { color: isActive ? theme.onPrimaryContainer : theme.onSurfaceVariant },
                  ]}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeCheck, { backgroundColor: theme.primary }]}>
                      <MaterialIcons name="check" size={12} color={theme.onPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Font Size */}
          <Text style={[styles.subsectionLabel, { color: theme.onSurfaceVariant, marginTop: spacing.lg }]}>Font Size</Text>
          <View style={[styles.fontSizeRow, { backgroundColor: theme.surfaceContainer }]}>
            {FONT_SIZES.map((sz) => {
              const isActive = Math.abs(preferences.fontScale - sz.value) < 0.01;
              return (
                <TouchableOpacity
                  key={sz.value}
                  style={[
                    styles.fontSizeBtn,
                    { backgroundColor: isActive ? theme.primary : 'transparent' },
                  ]}
                  onPress={() => { hapticSelection(); setPreference('fontScale', sz.value); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.fontSizeBtnLabel,
                    { color: isActive ? theme.onPrimary : theme.onSurfaceVariant },
                  ]}>
                    {sz.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.fontSizePreview, { color: theme.onSurface, fontSize: 14 * (preferences.fontScale || 1) }]}>
            Preview: The quick brown fox jumps over the lazy dog
          </Text>
        </Animated.View>

        {/* Dashboard Layout */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Dashboard Layout</Text>
          <View style={styles.layoutGrid}>
            {DASHBOARD_LAYOUTS.map((opt) => (
              <LayoutOption
                key={opt.value}
                {...opt}
                isActive={preferences.dashboardLayout === opt.value}
                onPress={() => {
                  hapticSuccess();
                  setPreference('dashboardLayout', opt.value as 'grid' | 'list' | 'compact');
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Profile Layout */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Profile Layout</Text>
          <View style={styles.layoutGrid}>
            {PROFILE_LAYOUTS.map((opt) => (
              <LayoutOption
                key={opt.value}
                {...opt}
                isActive={preferences.profileLayout === opt.value}
                onPress={() => {
                  hapticSuccess();
                  setPreference('profileLayout', opt.value as 'full' | 'minimal');
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Quick Capture */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Quick Capture</Text>
          <ScreenToggle
            label="Show on Home Screen"
            icon="add-circle"
            enabled={preferences.showQuickCaptureOnHome}
            onToggle={(val) => setPreference('showQuickCaptureOnHome', val)}
          />
        </Animated.View>

        {/* Visible Screens */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={[styles.sectionTitle, { color: theme.onSurfaceVariant }]}>Visible Screens</Text>
          <Text style={[styles.sectionHelp, { color: theme.onSurfaceVariant }]}>
            Toggle which screens appear in navigation
          </Text>
          {SCREENS.map((screen) => (
            <ScreenToggle
              key={screen.key}
              label={screen.label}
              icon={screen.icon}
              enabled={preferences.visibleScreens[screen.key as keyof typeof preferences.visibleScreens]}
              onToggle={(val) => setScreenVisibility(screen.key as keyof typeof preferences.visibleScreens, val)}
            />
          ))}
        </Animated.View>

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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: m3Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginLeft: spacing.sm },
  headerTitle: {
    fontSize: m3Typography.titleLarge.fontSize,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: m3Typography.labelMedium.fontSize,
    marginTop: 2,
  },

  /* Content */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: m3Typography.labelLarge.fontSize,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHelp: {
    fontSize: m3Typography.bodySmall.fontSize,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },

  /* Layout Options */
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  layoutOption: {
    width: '31%',
    padding: spacing.md,
    borderRadius: m3Radii.xl,
    alignItems: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  layoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  layoutLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '600',
  },
  layoutDesc: {
    fontSize: m3Typography.labelSmall.fontSize - 1,
    textAlign: 'center',
  },
  activeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Typography */
  subsectionLabel: {
    fontSize: m3Typography.labelMedium.fontSize,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fontCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: m3Radii.xl,
    position: 'relative',
    gap: 4,
  },
  fontSample: {
    fontSize: 15,
    lineHeight: 22,
  },
  fontName: {
    fontSize: m3Typography.labelSmall.fontSize,
    marginTop: 2,
  },
  monoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  monoSample: {
    fontSize: 13,
    lineHeight: 20,
  },
  fontSizeRow: {
    flexDirection: 'row',
    borderRadius: m3Radii.xl,
    padding: 4,
    gap: 4,
  },
  fontSizeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: m3Radii.lg,
  },
  fontSizeBtnLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '600',
  },
  fontSizePreview: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
    opacity: 0.7,
  },

  /* Toggle Rows */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: m3Radii.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    fontSize: m3Typography.titleSmall.fontSize,
    fontWeight: '500',
  },
});
