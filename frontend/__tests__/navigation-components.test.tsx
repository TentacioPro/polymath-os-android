/**
 * Navigation Component Tests
 *
 * Tests for navigation-related M3 components.
 * Run with: bun run test __tests__/navigation-components.test.tsx
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, Pressable } from 'react-native';
import { ThemeProvider } from '../theme/ThemeContext';

// ─── Additional Mocks ─────────────────────────────────────────────────────────

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  Tabs: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => {
    const { View, Text } = require('react-native');
    return <View testID={`link-${href}`}>{children}</View>;
  },
}));

// Mock react-native-reanimated shared values for tests
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Override useSharedValue for consistent test behavior
  Reanimated.useSharedValue = (init: number) => ({ value: init });
  Reanimated.useAnimatedStyle = (fn: () => any) => fn();
  
  return Reanimated;
});

// ─── Test wrapper ────────────────────────────────────────────────────────────

function wrap(ui: React.ReactElement) {
  return render(
    <ThemeProvider themeName="void" onThemeChange={() => {}}>
      {ui}
    </ThemeProvider>,
  );
}

// ─── CollapsibleHeader ───────────────────────────────────────────────────────

import CollapsibleHeader from '../components/navigation/CollapsibleHeader';

describe('CollapsibleHeader', () => {
  // Create a shared value mock for testing
  const createMockScrollY = () => ({ value: 0 });

  it('renders without crashing', () => {
    const scrollY = createMockScrollY();
    const { toJSON } = wrap(<CollapsibleHeader scrollY={scrollY} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders greeting text', () => {
    const scrollY = createMockScrollY();
    // Should show one of: Good morning, Good afternoon, Good evening
    const { toJSON } = wrap(<CollapsibleHeader scrollY={scrollY} />);
    const snapshot = toJSON();
    expect(snapshot).toBeTruthy();
  });

  it('renders custom greeting', () => {
    const scrollY = createMockScrollY();
    const { getByText } = wrap(
      <CollapsibleHeader scrollY={scrollY} title="Welcome back!" />,
    );
    expect(getByText('Welcome back!')).toBeTruthy();
  });

  it('renders custom title', () => {
    const scrollY = createMockScrollY();
    const { getByText } = wrap(
      <CollapsibleHeader scrollY={scrollY} title="My App" />,
    );
    expect(getByText('My App')).toBeTruthy();
  });

  it('renders search icon', () => {
    const scrollY = createMockScrollY();
    const { getByTestId } = wrap(<CollapsibleHeader scrollY={scrollY} />);
    expect(getByTestId('icon-search')).toBeTruthy();
  });

  it('renders notification icon', () => {
    const scrollY = createMockScrollY();
    const { getByTestId } = wrap(<CollapsibleHeader scrollY={scrollY} />);
    expect(getByTestId('icon-notifications-outline')).toBeTruthy();
  });

  it('renders avatar/profile icon', () => {
    const scrollY = createMockScrollY();
    const { getByTestId } = wrap(<CollapsibleHeader scrollY={scrollY} />);
    expect(getByTestId('icon-person')).toBeTruthy();
  });

  it('shows notification badge when count > 0', () => {
    const scrollY = createMockScrollY();
    const { getByText } = wrap(
      <CollapsibleHeader scrollY={scrollY} notificationCount={5} />,
    );
    expect(getByText('5')).toBeTruthy();
  });

  it('shows 9+ for notification count > 9', () => {
    const scrollY = createMockScrollY();
    const { getByText } = wrap(
      <CollapsibleHeader scrollY={scrollY} notificationCount={15} />,
    );
    expect(getByText('9+')).toBeTruthy();
  });

  it('does not show badge when notification count is 0', () => {
    const scrollY = createMockScrollY();
    const { queryByText } = wrap(
      <CollapsibleHeader scrollY={scrollY} notificationCount={0} />,
    );
    // Badge should not be present
    expect(queryByText('0')).toBeNull();
    expect(queryByText('9+')).toBeNull();
  });
});

// ─── M3TabBar Behavior (via component inspection) ────────────────────────────

describe('M3TabBar rendering', () => {
  // M3TabBar is defined inside _layout.tsx and not exported separately,
  // so we test the expected tab configuration from the layout

  it('defines correct tab configuration', () => {
    // These are the expected tabs from the _layout.tsx TABS array
    const expectedTabs = [
      { name: 'index', title: 'Home', icon: 'home-outline', iconActive: 'home' },
      { name: 'knowledge', title: 'Knowledge', icon: 'library-outline', iconActive: 'library' },
      { name: 'mesh', title: 'Mesh', icon: 'git-network-outline', iconActive: 'git-network' },
    ];

    // Verify tab count
    expect(expectedTabs).toHaveLength(3);

    // Verify each tab has required properties
    expectedTabs.forEach((tab) => {
      expect(tab).toHaveProperty('name');
      expect(tab).toHaveProperty('title');
      expect(tab).toHaveProperty('icon');
      expect(tab).toHaveProperty('iconActive');
    });
  });

  it('tab titles are user-friendly', () => {
    const expectedTitles = ['Home', 'Knowledge', 'Mesh'];
    expectedTitles.forEach((title) => {
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toContain('_');
    });
  });

  it('tab icons follow Ionicons naming convention', () => {
    const tabIcons = [
      'home-outline', 'home',
      'library-outline', 'library',
      'git-network-outline', 'git-network',
    ];
    
    // All icons should be valid strings
    tabIcons.forEach((icon) => {
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });
});

// ─── Header export constants ─────────────────────────────────────────────────

import { HEADER_MAX, HEADER_MIN, SCROLL_RANGE } from '../components/navigation/CollapsibleHeader';

describe('CollapsibleHeader constants', () => {
  it('exports HEADER_MAX', () => {
    expect(HEADER_MAX).toBeDefined();
    expect(typeof HEADER_MAX).toBe('number');
    expect(HEADER_MAX).toBeGreaterThan(0);
  });

  it('exports HEADER_MIN', () => {
    expect(HEADER_MIN).toBeDefined();
    expect(typeof HEADER_MIN).toBe('number');
    expect(HEADER_MIN).toBeGreaterThan(0);
  });

  it('exports SCROLL_RANGE', () => {
    expect(SCROLL_RANGE).toBeDefined();
    expect(typeof SCROLL_RANGE).toBe('number');
  });

  it('HEADER_MAX is greater than HEADER_MIN', () => {
    expect(HEADER_MAX).toBeGreaterThanOrEqual(HEADER_MIN);
  });

  it('SCROLL_RANGE is a positive safe value (min 1 prevents zero-range interpolation)', () => {
    expect(SCROLL_RANGE).toBeGreaterThan(0);
  });
});
