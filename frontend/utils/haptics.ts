/**
 * Haptic feedback utilities for Polymath OS.
 * Provides consistent haptic feedback across the app.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light haptic feedback - for subtle interactions like toggles, selections
 */
export const hapticLight = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Medium haptic feedback - for button presses, navigation
 */
export const hapticMedium = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

/**
 * Heavy haptic feedback - for significant actions, confirmations
 */
export const hapticHeavy = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Selection haptic - for picker/selector changes
 */
export const hapticSelection = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
};

/**
 * Success notification haptic
 */
export const hapticSuccess = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Warning notification haptic
 */
export const hapticWarning = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

/**
 * Error notification haptic
 */
export const hapticError = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/**
 * Haptic for tab/nav switching
 */
export const hapticTab = hapticLight;

/**
 * Haptic for button press
 */
export const hapticPress = hapticMedium;

/**
 * Haptic for drawer open/close
 */
export const hapticDrawer = hapticLight;

/**
 * Haptic for pull-to-refresh trigger
 */
export const hapticRefresh = hapticMedium;
