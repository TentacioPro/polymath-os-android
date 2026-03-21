import { useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme, isDarkTheme } from '../theme';
import type { ThemeName } from '../theme';
import { useStore } from '../store/useStore';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { initBackendUrl } from '../utils/backend';
import { initSentry } from '../utils/sentry';
import { initAnalytics } from '../utils/analytics';
import { hexLuminance } from '../../shared/design-tokens';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

// Initialize Sentry for error tracking (runs early)
initSentry();

// Initialize analytics
initAnalytics(true);

function AppContent({ onLayoutReady }: { onLayoutReady: () => void }) {
  const { theme, themeName } = useTheme();
  const bgColor = theme.surface;

  // Auto-detect status bar style from surface luminance
  const statusStyle = hexLuminance(theme.surface) > 0.5 ? 'dark' : 'light';

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }} onLayout={onLayoutReady}>
      <StatusBar style={statusStyle} />
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
        <Stack.Screen name="customize" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const themeName = useStore((s) => s.themeName);
  const setThemeName = useStore((s) => s.setThemeName);

  const [fontsLoaded] = useFonts({
    // DM Sans (default)
    'DMSans': require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    'DMSans-Medium': require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf'),
    'DMSans-Bold': require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
    // Inter
    'Inter': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    'Inter-Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    'Inter-Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
    // Outfit
    'Outfit': require('@expo-google-fonts/outfit/400Regular/Outfit_400Regular.ttf'),
    'Outfit-Medium': require('@expo-google-fonts/outfit/500Medium/Outfit_500Medium.ttf'),
    'Outfit-Bold': require('@expo-google-fonts/outfit/700Bold/Outfit_700Bold.ttf'),
    // Space Grotesk (original)
    'SpaceGrotesk': require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    // JetBrains Mono
    'JetBrainsMono': require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
    'JetBrainsMono-Bold': require('@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'),
    // Space Mono (original)
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
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
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider themeName={themeName} onThemeChange={handleThemeChange}>
            <AppContent onLayoutReady={onLayoutReady} />
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
