/**
 * Responsive layout utilities for Polymath OS.
 * Provides hooks for device-width-aware grid calculations.
 */
import { useWindowDimensions } from 'react-native';
import { spacing } from '../theme';

/**
 * Returns an optimal column count based on available width and minimum card width.
 * Adapts automatically to phone / tablet / landscape orientations.
 *
 * @param minCardWidth Minimum desired width for each card (default 160dp)
 * @returns { cols, cardWidth } — column count and calculated card width
 */
export function useResponsiveColumns(minCardWidth = 160) {
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2; // left + right screen padding
  const availableWidth = width - horizontalPadding;
  const cols = Math.max(2, Math.floor(availableWidth / minCardWidth));
  const gap = spacing.sm;
  const cardWidth = (availableWidth - gap * (cols - 1)) / cols;
  return { cols, cardWidth, gap };
}

/**
 * Returns a calculated card width for a fixed column count.
 * Useful when column count is predetermined (e.g. 3-col layout options).
 *
 * @param numCols Number of columns
 * @param gapSize Gap between cards (default spacing.sm)
 */
export function useCardWidth(numCols: number, gapSize?: number) {
  const { width } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2;
  const gap = gapSize ?? spacing.sm;
  const availableWidth = width - horizontalPadding;
  const cardWidth = (availableWidth - gap * (numCols - 1)) / numCols;
  return { cardWidth, gap };
}
