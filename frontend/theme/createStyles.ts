import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { ThemeTokens } from './tokens';
import { m3Elevation } from './tokens';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates themed styles that automatically update when the theme changes.
 *
 * Usage:
 * ```ts
 * const useStyles = createThemedStyles((theme) => ({
 *   container: { backgroundColor: theme.surface },
 *   text: { color: theme.onSurface },
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
 * M3 elevation helper — returns shadow style for the given elevation level.
 * Replaces the old useArchitectShadow.
 */
export function useM3Elevation(level: keyof typeof m3Elevation = 'level2') {
  const { theme } = useTheme();
  return useMemo(
    () => ({
      ...m3Elevation[level],
      shadowColor: theme.onSurface,
    }),
    [theme, level],
  );
}

/**
 * @deprecated Use useM3Elevation instead. Kept for migration.
 */
export function useArchitectShadow(_intense = false) {
  return useM3Elevation('level2');
}
