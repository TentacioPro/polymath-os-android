import { useCallback, useEffect, useMemo } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { ThemeProvider, useTheme } from '../theme';
import type { ThemeName } from '../theme';
import { useStore } from '../store/useStore';
import AppDrawer from '../components/navigation/AppDrawer';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { initBackendUrl } from '../utils/backend';
import { initSentry } from '../utils/sentry';
import { initAnalytics } from '../utils/analytics';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

// Initialize Sentry for error tracking (runs early)
initSentry();

// Initialize analytics
initAnalytics(true);

// Theme background map to prevent white flash
const THEME_BACKGROUNDS: Record<ThemeName, string> = {
  void: '#000000',
  nova: '#FFFFFF',
  amber: '#000000',
  ocean: '#0A1628',
  forest: '#0A1A0A',
  sunset: '#1A0A0A',
  midnight: '#0F0A1A',
};

function AppContent({ onLayoutReady }: { onLayoutReady: () => void }) {
  const { theme, themeName } = useTheme();
  const bgColor = theme.background;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }} onLayout={onLayoutReady}>
      <StatusBar style={themeName === 'nova' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bgColor },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="agent" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="integrations" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="export" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="activity-detail" />
        <Stack.Screen name="search" />
      </Stack>
      <AppDrawer />
    </View>
  );
}

export default function RootLayout() {
  const themeName = useStore((s) => s.themeName);
  const setThemeName = useStore((s) => s.setThemeName);
  const rootBg = THEME_BACKGROUNDS[themeName];

  const [fontsLoaded] = useFonts({
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await initBackendUrl();
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleThemeChange = useCallback(
    (name: ThemeName) => setThemeName(name),
    [setThemeName],
  );

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: rootBg }} />
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: rootBg }}>
      <ErrorBoundary>
        <ThemeProvider themeName={themeName} onThemeChange={handleThemeChange}>
          <AppContent onLayoutReady={onLayoutReady} />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
