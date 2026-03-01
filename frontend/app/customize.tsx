import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, fs, sw } from '../theme';
import { useStore } from '../store/useStore';
import { hapticLight, hapticPress, hapticSuccess, hapticSelection } from '../utils/haptics';

// Layout option metadata
const DASHBOARD_LAYOUTS = [
  { value: 'grid', label: 'Grid', desc: 'Card grid with stats', icon: 'grid-view' as const },
  { value: 'list', label: 'List', desc: 'Vertical feed style', icon: 'view-list' as const },
  { value: 'compact', label: 'Compact', desc: 'Dense information', icon: 'view-compact' as const },
];

const PROFILE_LAYOUTS = [
  { value: 'full', label: 'Full', desc: 'All sections visible', icon: 'person' as const },
  { value: 'minimal', label: 'Minimal', desc: 'Essential info only', icon: 'person-outline' as const },
];

const SIDEBAR_POSITIONS = [
  { value: 'left', label: 'Left', desc: 'Drawer from left edge', icon: 'chevron-right' as const },
  { value: 'right', label: 'Right', desc: 'Drawer from right edge', icon: 'chevron-left' as const },
  { value: 'hidden', label: 'Hidden', desc: 'No sidebar drawer', icon: 'close' as const },
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

  // Colors
  const bg = theme.background;
  const surface = theme.surface;
  const text = theme.textPrimary;
  const textMuted = theme.textSecondary;
  const accent = theme.accent;
  const border = theme.borderMuted;

  const LayoutOption = ({
    value,
    label,
    desc,
    icon,
    isActive,
    onPress,
  }: {
    value: string;
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
          backgroundColor: isActive ? accent + '20' : surface,
          borderColor: isActive ? accent : border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.layoutIcon, { backgroundColor: isActive ? accent : surface }]}>
        <MaterialIcons
          name={icon}
          size={18}
          color={isActive ? theme.accentContrast : textMuted}
        />
      </View>
      <Text style={[styles.layoutLabel, { color: isActive ? accent : text }]}>{label}</Text>
      <Text style={[styles.layoutDesc, { color: textMuted }]}>{desc}</Text>
      {isActive && (
        <View style={[styles.activeCheck, { backgroundColor: accent }]}>
          <MaterialIcons name="check" size={12} color={theme.accentContrast} />
        </View>
      )}
    </TouchableOpacity>
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
    icon: keyof typeof MaterialIcons.glyphMap;
    enabled: boolean;
    onToggle: (val: boolean) => void;
  }) => (
    <View style={[styles.toggleRow, { backgroundColor: surface, borderColor: border }]}>
      <View style={[styles.toggleIcon, { backgroundColor: enabled ? accent + '20' : bg }]}>
        <MaterialIcons name={icon} size={18} color={enabled ? accent : textMuted} />
      </View>
      <Text style={[styles.toggleLabel, { color: text }]}>{label}</Text>
      <Switch
        value={enabled}
        onValueChange={(val) => {
          hapticSelection();
          onToggle(val);
        }}
        trackColor={{ false: border, true: accent + '60' }}
        thumbColor={enabled ? accent : textMuted}
      />
    </View>
  );

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
          <Text style={[styles.title, { color: text }]}>Customize</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Layout & visibility</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Layout */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>DASHBOARD LAYOUT</Text>
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

        {/* Profile Layout */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>PROFILE LAYOUT</Text>
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

        {/* Sidebar Position */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>SIDEBAR POSITION</Text>
        <View style={styles.layoutGrid}>
          {SIDEBAR_POSITIONS.map((opt) => (
            <LayoutOption
              key={opt.value}
              {...opt}
              isActive={preferences.sidebarPosition === opt.value}
              onPress={() => {
                hapticSuccess();
                setPreference('sidebarPosition', opt.value as 'left' | 'right' | 'hidden');
              }}
            />
          ))}
        </View>

        {/* Quick Capture */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>QUICK CAPTURE</Text>
        <ScreenToggle
          screenKey="quickCaptureHome"
          label="Show on Home Screen"
          icon="add-circle"
          enabled={preferences.showQuickCaptureOnHome}
          onToggle={(val) => setPreference('showQuickCaptureOnHome', val)}
        />
        <ScreenToggle
          screenKey="quickCaptureSidebar"
          label="Show in Sidebar"
          icon="menu"
          enabled={preferences.showQuickCaptureInSidebar}
          onToggle={(val) => setPreference('showQuickCaptureInSidebar', val)}
        />

        {/* Visible Screens */}
        <Text style={[styles.sectionTitle, { color: textMuted }]}>VISIBLE SCREENS</Text>
        <Text style={[styles.sectionHelp, { color: textMuted }]}>
          Toggle which screens appear in navigation
        </Text>
        {SCREENS.map((screen) => (
          <ScreenToggle
            key={screen.key}
            screenKey={screen.key}
            label={screen.label}
            icon={screen.icon}
            enabled={preferences.visibleScreens[screen.key as keyof typeof preferences.visibleScreens]}
            onToggle={(val) => setScreenVisibility(screen.key as keyof typeof preferences.visibleScreens, val)}
          />
        ))}

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
  sectionHelp: {
    fontSize: fs(12),
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
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  layoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  layoutLabel: {
    fontSize: fs(12),
    fontWeight: '600',
  },
  layoutDesc: {
    fontSize: fs(9),
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

  /* Toggle Rows */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    fontSize: fs(14),
    fontWeight: '500',
  },
});
