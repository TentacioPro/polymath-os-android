import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { ThemeTokens } from './tokens';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates themed styles that automatically update when the theme changes.
 * 
 * Usage:
 * ```ts
 * const useStyles = createThemedStyles((theme) => ({
 *   container: { backgroundColor: theme.background },
 *   text: { color: theme.textPrimary },
 * }));
 * 
 * function MyComponent() {
 *   const styles = useStyles();
 *   return <View style={styles.container}><Text style={styles.text}>...</Text></View>;
 * }
 * ```
 */
export function createThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: ThemeTokens) => T,
) {
  return function useThemedStyles(): T {
    const { theme } = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)) as unknown as T, [theme]);
  };
}

/**
 * Helper to get the architect shadow style for the current theme.
 */
export function useArchitectShadow(intense = false) {
  const { theme } = useTheme();
  return useMemo(
    () => ({
      shadowColor: intense ? theme.pill.shadow : theme.shadow,
      shadowOffset: theme.shadowOffset,
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    }),
    [theme, intense],
  );
}
