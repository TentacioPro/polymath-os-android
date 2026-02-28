/**
 * Responsive scaling utility for Polymath OS.
 * 
 * Base dimensions: Pixel 8a (412dp × 932dp at ~2.5x density).
 * All sizing functions scale proportionally so the UI looks correct
 * on smaller/larger screens (Pixel 5 through tablets).
 */
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Pixel 8a reference dimensions in dp
const BASE_WIDTH = 412;
const BASE_HEIGHT = 932;

/** Horizontal scale factor relative to Pixel 8a */
const hScale = SCREEN_WIDTH / BASE_WIDTH;
/** Vertical scale factor relative to Pixel 8a */
const vScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Scale a value based on screen width.
 * Use for widths, horizontal paddings, horizontal margins, icon sizes.
 */
export const sw = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * hScale));

/**
 * Scale a value based on screen height.
 * Use for heights, vertical paddings, vertical margins.
 */
export const sh = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * vScale));

/**
 * Moderate scale — blends horizontal + vertical for balanced scaling.
 * Use for font sizes, border widths, border radii, icon sizes.
 * factor: 0 = no scaling, 0.5 = moderate, 1 = full width-based.
 */
export const ms = (size: number, factor = 0.5): number =>
  Math.round(PixelRatio.roundToNearestPixel(size + (size * hScale - size) * factor));

/**
 * Font scale — moderate scale tuned for readability.
 * Keeps fonts responsive but not excessively large/small.
 */
export const fs = (size: number): number => ms(size, 0.35);

/**
 * Percentage of screen width in dp.
 */
export const wp = (percent: number): number =>
  Math.round(PixelRatio.roundToNearestPixel((percent / 100) * SCREEN_WIDTH));

/**
 * Percentage of screen height in dp.
 */
export const hp = (percent: number): number =>
  Math.round(PixelRatio.roundToNearestPixel((percent / 100) * SCREEN_HEIGHT));

/** Useful screen dimension exports */
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isLargeDevice = SCREEN_WIDTH >= 428;
