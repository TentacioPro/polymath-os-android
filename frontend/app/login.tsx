import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { m3Typography, m3Spacing, m3Radii, m3TouchTarget } from '../../shared/design-tokens';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    
    // Debug logging
    console.log('[LOGIN] Attempting login with:', { email: email.trim(), passwordLength: password.length });
    console.log('[LOGIN] Backend URL being used:', process.env.EXPO_PUBLIC_BACKEND_URL);
    
    try {
      // Trim both email and password to remove any accidental whitespace
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      console.log('[LOGIN] Sending credentials:', { 
        email: trimmedEmail, 
        passwordLength: trimmedPassword.length,
        originalPasswordLength: password.length
      });
      
      await login(trimmedEmail, trimmedPassword);
      // Auth gate in _layout.tsx will handle navigation
    } catch (err: any) {
      console.error('[LOGIN] Error:', err);
      console.error('[LOGIN] Response:', err?.response);
      console.error('[LOGIN] Data:', err?.response?.data);
      
      const detail = err?.response?.data?.detail;
      if (err?.response?.status === 423) {
        setError(detail || 'Account locked. Please try again later.');
      } else {
        setError(detail || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const bg = theme.surface;
  const cardBg = theme.surfaceContainerHigh;
  const textColor = theme.onSurface;
  const textMuted = theme.onSurfaceVariant;
  const primary = theme.primary;
  const onPrimary = theme.onPrimary;
  const border = theme.outlineVariant;
  const errorColor = theme.error;
  const errorContainer = theme.errorContainer;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + m3Spacing.hero, paddingBottom: insets.bottom + m3Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: primary }]}>
            <MaterialIcons name="psychology" size={32} color={onPrimary} />
          </View>
          <Text style={[styles.appTitle, { color: textColor }]}>Polymath OS</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Sign in to your account</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          {/* Error Banner */}
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: errorContainer }]}>
              <MaterialIcons name="error-outline" size={18} color={errorColor} />
              <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={[styles.label, { color: textMuted }]}>EMAIL</Text>
          <View style={[styles.inputRow, { borderColor: border }]}>
            <MaterialIcons name="mail-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={textMuted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <Text style={[styles.label, { color: textMuted, marginTop: m3Spacing.md }]}>PASSWORD</Text>
          <View style={[styles.inputRow, { borderColor: border }]}>
            <MaterialIcons name="lock-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={textMuted}
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
              style={styles.eyeBtn}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={textMuted}
              />
            </Pressable>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleLogin}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: primary, opacity: !canSubmit ? 0.5 : pressed ? 0.8 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={onPrimary} />
            ) : (
              <Text style={[styles.submitText, { color: onPrimary }]}>Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Register Link */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: textMuted }]}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={[styles.footerLink, { color: primary }]}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: m3Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: m3Spacing.xl,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: m3Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: m3Spacing.md,
  },
  appTitle: {
    fontSize: m3Typography.headlineMedium.fontSize,
    fontWeight: '700',
    lineHeight: m3Typography.headlineMedium.lineHeight,
  },
  subtitle: {
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
    marginTop: m3Spacing.xs,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: m3Radii.xl,
    borderWidth: 1,
    padding: m3Spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: m3Spacing.sm,
    padding: m3Spacing.md,
    borderRadius: m3Radii.lg,
    marginBottom: m3Spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: m3Typography.bodySmall.fontSize,
    lineHeight: m3Typography.bodySmall.lineHeight,
  },
  label: {
    fontSize: m3Typography.labelSmall.fontSize,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: m3Spacing.xs + 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: m3Radii.lg,
    height: m3TouchTarget.comfortable,
    paddingHorizontal: m3Spacing.md,
  },
  inputIcon: {
    marginRight: m3Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: m3Spacing.xs,
  },
  submitBtn: {
    height: m3TouchTarget.comfortable,
    borderRadius: m3Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: m3Spacing.lg,
  },
  submitText: {
    fontSize: m3Typography.bodyMedium.fontSize,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: m3Spacing.lg,
  },
  footerText: {
    fontSize: m3Typography.bodySmall.fontSize,
  },
  footerLink: {
    fontSize: m3Typography.bodySmall.fontSize,
    fontWeight: '600',
  },
});
