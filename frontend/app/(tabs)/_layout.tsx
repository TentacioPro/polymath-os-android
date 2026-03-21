import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import CollapsibleHeader from '../../components/navigation/CollapsibleHeader';
import FAB from '../../components/ui/FAB';
import { m3Radii } from '../../../shared/design-tokens';

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
                {
                  backgroundColor: isFocused
                    ? theme.primaryContainer
                    : 'transparent',
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
  const scrollY = useSharedValue(0);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  const handleFABPress = useCallback(() => {
    setQuickCaptureOpen(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <CollapsibleHeader scrollY={scrollY} />
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
      <FAB
        icon="add"
        label="Capture"
        onPress={handleFABPress}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: m3Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
