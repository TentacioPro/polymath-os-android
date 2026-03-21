import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
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
  const borderColor = hasError
    ? theme.error
    : focused
      ? theme.primary
      : theme.outlineVariant;

  const labelStyle = useAnimatedStyle(() => {
    const top = interpolate(labelPosition.value, [0, 1], [16, -8]);
    const fontSize = interpolate(labelPosition.value, [0, 1], [16, 12]);
    return { top, fontSize };
  });

  const isOutlined = variant === 'outlined';

  return (
    <View style={styles.container}>
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
        {trailingIcon && (
          <Pressable onPress={onTrailingIconPress} style={styles.trailingIcon}>
            <Ionicons name={trailingIcon} size={20} color={theme.onSurfaceVariant} />
          </Pressable>
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
    marginRight: 12,
  },
  trailingIcon: {
    marginLeft: 12,
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
