import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useStore } from '../../store/useStore';
import CollapsibleHeader from '../../components/navigation/CollapsibleHeader';
import MobileDrawer from '../../components/navigation/MobileDrawer';
import QuickCapture from '../../components/navigation/QuickCapture';
import FAB from '../../components/ui/FAB';
import { m3Radii, m3Typography } from '../../../shared/design-tokens';

type TabIcon = keyof typeof Ionicons.glyphMap;

interface TabItem {
  name: string;
  title: string;
  icon: TabIcon;
  iconActive: TabIcon;
}

const TABS: TabItem[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'knowledge', title: 'Knowledge', icon: 'library-outline', iconActive: 'library' },
  { name: 'mesh', title: 'Mesh', icon: 'git-network-outline', iconActive: 'git-network' },
];

function M3TabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBar,
      { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 8) },
    ]}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS[index];
        if (!tab) return null;

        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View
              style={[
                styles.indicator,
                isFocused ? {
                  backgroundColor: theme.primaryContainer,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                } : {
                  backgroundColor: 'transparent',
                },
              ]}
            >
              <Ionicons
                name={isFocused ? tab.iconActive : tab.icon}
                size={22}
                color={
                  isFocused ? theme.onPrimaryContainer : theme.onSurfaceVariant
                }
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? theme.onSurface
                    : theme.onSurfaceVariant,
                  fontWeight: isFocused ? '600' : '400',
                },
              ]}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  const { preferences } = useStore();
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const showFAB = preferences.showQuickCaptureOnHome && !quickCaptureOpen;

  const handleFABPress = useCallback(() => {
    setQuickCaptureOpen(true);
  }, []);

  const handleOpenDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleCloseQuickCapture = useCallback(() => {
    setQuickCaptureOpen(false);
  }, []);

  // Compute tab bar height for FAB clearance:
  // paddingTop(8) + indicator row (~36) + paddingBottom(max(insets.bottom, 8))
  const tabBarHeight = 8 + 36 + Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <CollapsibleHeader scrollY={scrollY} onHamburgerPress={handleOpenDrawer} />
      <Tabs
        tabBar={(props) => <M3TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.surface },
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title }}
          />
        ))}
      </Tabs>
      {showFAB && (
        <FAB
          icon="add"
          label="Capture"
          onPress={handleFABPress}
          style={{ bottom: tabBarHeight + 24, right: 24 }}
        />
      )}
      <MobileDrawer visible={drawerOpen} onClose={handleCloseDrawer} />
      <QuickCapture visible={quickCaptureOpen} onClose={handleCloseQuickCapture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  indicator: {
    width: 64,
    height: 32,
    borderRadius: m3Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: m3Typography.labelSmall.fontSize,
    letterSpacing: 0.5,
  },
});
