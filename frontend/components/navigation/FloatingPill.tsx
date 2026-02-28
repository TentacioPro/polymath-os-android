import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, spacing } from '../../theme';
import QuickCapture from './QuickCapture';

const PILL_MAX_WIDTH = 360;
const PILL_BOTTOM_OFFSET = 24;

interface PillTab {
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const TABS: PillTab[] = [
  { name: 'index', icon: 'dashboard' },
  { name: 'knowledge', icon: 'hub' },
  { name: 'mesh', icon: 'grain' },
];

interface FloatingPillProps {
  state: any;
  descriptors: any;
  navigation: any;
}

/**
 * Custom floating pill bottom nav bar.
 * 3 nav icons + 1 action (add) button on the right.
 * Always black bg, theme-aware border & shadow.
 * Maps to Stitch prd_4/6/7/9/12 floating pill pattern.
 */
export default function FloatingPill({ state, descriptors, navigation }: FloatingPillProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const [captureVisible, setCaptureVisible] = useState(false);

  const pillWidth = Math.min(screenWidth * 0.9, PILL_MAX_WIDTH);
  const bottomOffset = PILL_BOTTOM_OFFSET + insets.bottom;

  const handleCapture = () => {
    setCaptureVisible(true);
  };

  return (
    <>
    <QuickCapture
      visible={captureVisible}
      onClose={() => setCaptureVisible(false)}
    />
    <View
      style={[
        styles.wrapper,
        { bottom: bottomOffset },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
          {
            width: pillWidth,
            backgroundColor: theme.pill.background,
            borderColor: theme.pill.border,
            // Architect shadow
            shadowColor: theme.pill.shadow,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          },
        ]}
      >
        {/* Nav Icons */}
        <View style={styles.navGroup}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => {
                  const route = state.routes[index];
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.navItem}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={tab.icon}
                  size={22}
                  color={isActive ? theme.pill.activeColor : theme.pill.inactiveColor}
                />
                {/* Active dot indicator */}
                {isActive && (
                  <View
                    style={[
                      styles.activeDot,
                      { backgroundColor: theme.pill.activeColor },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action button (add / quickcapture) */}
        <TouchableOpacity
          onPress={handleCapture}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.pill.actionBackground,
            },
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="add"
            size={22}
            color={theme.pill.actionIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    ...Platform.select({
      web: { pointerEvents: 'box-none' as any },
    }),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
