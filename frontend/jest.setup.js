/**
 * Jest setup file for Polymath OS mobile tests.
 * Mocks native modules that don't exist in the test environment.
 */

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  // useReducedMotion not in the standard mock — add stub returning false (no reduced motion)
  Reanimated.useReducedMotion = jest.fn(() => false);
  return Reanimated;
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const MockIcon = (props) => {
    const React = require('react');
    return React.createElement(Text, { testID: `icon-${props.name}` }, props.name);
  };
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
  };
});

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage (native module, null in Jest)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence the warning about act()
global.__DEV__ = true;
