import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { m3Radii } from '../../../shared/design-tokens';

interface M3TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  variant?: 'outlined' | 'filled';
  error?: string;
  supportingText?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  onTrailingIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  maxLength?: number;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Loading — shows spinner in trailing position */
  loading?: boolean;
  /** Success — green border + success icon */
  success?: boolean;
}

export default function M3TextField({
  label,
  value,
  onChangeText,
  placeholder,
  variant = 'outlined',
  error,
  supportingText,
  leadingIcon,
  trailingIcon,
  onTrailingIconPress,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
  editable = true,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  loading,
  success,
}: M3TextFieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const labelPosition = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    labelPosition.value = withTiming(focused || value ? 1 : 0, { duration: 150 });
  }, [focused, value, labelPosition]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocusProp?.();
  }, [onFocusProp]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlurProp?.();
  }, [onBlurProp]);

  const hasError = !!error;
  const isDisabled = !editable;

  // Border color priority: error > success > focused > disabled > default
  const borderColor = hasError
    ? theme.error
    : success
      ? theme.success
      : focused
        ? theme.primary
        : isDisabled
          ? theme.outlineVariant
          : theme.outlineVariant;

  const labelStyle = useAnimatedStyle(() => {
    const top = interpolate(labelPosition.value, [0, 1], [16, -8]);
    const fontSize = interpolate(labelPosition.value, [0, 1], [16, 12]);
    return { top, fontSize };
  });

  const isOutlined = variant === 'outlined';

  return (
    <View style={[styles.container, isDisabled && styles.disabled]}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputContainer,
          isOutlined
            ? { borderWidth: focused ? 2 : 1, borderColor, borderRadius: m3Radii.lg }
            : {
                backgroundColor: theme.surfaceContainerHigh,
                borderBottomWidth: focused ? 2 : 1,
                borderBottomColor: borderColor,
                borderTopLeftRadius: m3Radii.sm,
                borderTopRightRadius: m3Radii.sm,
              },
        ]}
      >
        {leadingIcon && (
          <Ionicons
            name={leadingIcon}
            size={20}
            color={theme.onSurfaceVariant}
            style={styles.leadingIcon}
          />
        )}
        <View style={styles.inputWrap}>
          <Animated.Text
            style={[
              styles.label,
              {
                color: hasError ? theme.error : focused ? theme.primary : theme.onSurfaceVariant,
                backgroundColor: isOutlined ? theme.surface : 'transparent',
              },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={focused ? placeholder : undefined}
            placeholderTextColor={theme.onSurfaceVariant}
            style={[
              styles.input,
              { color: theme.onSurface },
              multiline && { minHeight: numberOfLines * 24, textAlignVertical: 'top' },
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            editable={editable}
          />
        </View>
        {trailingIcon && !loading && !success && (
          <Pressable onPress={onTrailingIconPress} style={styles.trailingIcon}>
            <Ionicons name={trailingIcon} size={20} color={theme.onSurfaceVariant} />
          </Pressable>
        )}
        {loading && (
          <ActivityIndicator size="small" color={theme.onSurfaceVariant} style={styles.trailingIcon} />
        )}
        {success && !loading && (
          <Ionicons name="checkmark-circle" size={20} color={theme.success} style={styles.trailingIcon} />
        )}
      </Pressable>
      {(error || supportingText) && (
        <Text
          style={[
            styles.supporting,
            { color: hasError ? theme.error : theme.onSurfaceVariant },
          ]}
        >
          {error || supportingText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  label: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 4,
    zIndex: 1,
    fontWeight: '400',
  },
  input: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    padding: 0,
    paddingTop: 8,
  },
  leadingIcon: {
    marginRight: 8,
  },
  trailingIcon: {
    marginLeft: 8,
    padding: 4,
  },
  supporting: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
