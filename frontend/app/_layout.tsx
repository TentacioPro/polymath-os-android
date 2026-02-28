import { useCallback, useMemo } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { ThemeProvider } from '../theme';
import type { ThemeName } from '../theme';
import { useStore } from '../store/useStore';
import AppDrawer from '../components/navigation/AppDrawer';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const themeName = useStore((s) => s.themeName);
  const setThemeName = useStore((s) => s.setThemeName);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk: require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleThemeChange = useCallback(
    (name: ThemeName) => setThemeName(name),
    [setThemeName],
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider themeName={themeName} onThemeChange={handleThemeChange}>
        <View style={{ flex: 1 }} onLayout={onLayoutReady}>
          <StatusBar style={themeName === 'nova' ? 'dark' : 'light'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
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
          </Stack>
          <AppDrawer />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
