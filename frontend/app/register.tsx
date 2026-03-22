import React, { useState, useMemo } from 'react';
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

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 12, label: '12+ characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Uppercase' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Lowercase' },
  { test: (p: string) => /\d/.test(p), label: 'Number' },
  { test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'`~]/.test(p), label: 'Special char' },
];

export default function RegisterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(password)).length,
    [password],
  );
  const passwordValid = strength === PASSWORD_RULES.length;
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = email.trim().length > 0 && passwordValid && confirmValid && !loading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
      // Auth gate in _layout.tsx will handle navigation
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d).join('. '));
      } else {
        setError(detail || 'Registration failed. Please try again.');
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
  const successColor = theme.success;

  const strengthColor =
    strength <= 2 ? errorColor : strength <= 4 ? theme.warning : successColor;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + m3Spacing.xxl, paddingBottom: insets.bottom + m3Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: primary }]}>
            <MaterialIcons name="psychology" size={32} color={onPrimary} />
          </View>
          <Text style={[styles.appTitle, { color: textColor }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Join Polymath OS</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: errorContainer }]}>
              <MaterialIcons name="error-outline" size={18} color={errorColor} />
              <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
            </View>
          ) : null}

          {/* Display Name */}
          <Text style={[styles.label, { color: textMuted }]}>DISPLAY NAME (optional)</Text>
          <View style={[styles.inputRow, { borderColor: border }]}>
            <MaterialIcons name="person-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={textMuted}
              autoComplete="name"
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <Text style={[styles.label, { color: textMuted, marginTop: m3Spacing.md }]}>EMAIL</Text>
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
              placeholder="Create a strong password"
              placeholderTextColor={textMuted}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="next"
              editable={!loading}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8} style={styles.eyeBtn}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={textMuted}
              />
            </Pressable>
          </View>

          {/* Strength Indicator */}
          {password.length > 0 && (
            <View style={styles.strengthSection}>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSegment,
                      {
                        backgroundColor: i <= strength ? strengthColor : border,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.rulesRow}>
                {PASSWORD_RULES.map((rule) => (
                  <View key={rule.label} style={styles.ruleItem}>
                    <MaterialIcons
                      name={rule.test(password) ? 'check-circle' : 'radio-button-unchecked'}
                      size={12}
                      color={rule.test(password) ? successColor : textMuted}
                    />
                    <Text
                      style={[
                        styles.ruleText,
                        { color: rule.test(password) ? successColor : textMuted },
                      ]}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Confirm Password */}
          <Text style={[styles.label, { color: textMuted, marginTop: m3Spacing.md }]}>CONFIRM PASSWORD</Text>
          <View
            style={[
              styles.inputRow,
              {
                borderColor: confirmPassword.length > 0 && !confirmValid ? errorColor : border,
              },
            ]}
          >
            <MaterialIcons name="lock-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
              placeholderTextColor={textMuted}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              editable={!loading}
            />
            {confirmPassword.length > 0 && (
              <MaterialIcons
                name={confirmValid ? 'check-circle' : 'cancel'}
                size={20}
                color={confirmValid ? successColor : errorColor}
              />
            )}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleRegister}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: primary, opacity: !canSubmit ? 0.5 : pressed ? 0.8 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={onPrimary} />
            ) : (
              <Text style={[styles.submitText, { color: onPrimary }]}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: textMuted }]}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: primary }]}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: m3Spacing.lg,
  },
  logoSection: { alignItems: 'center', marginBottom: m3Spacing.xl },
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
  inputIcon: { marginRight: m3Spacing.sm },
  input: {
    flex: 1,
    fontSize: m3Typography.bodyMedium.fontSize,
    lineHeight: m3Typography.bodyMedium.lineHeight,
    paddingVertical: 0,
  },
  eyeBtn: { padding: m3Spacing.xs },
  strengthSection: { marginTop: m3Spacing.sm },
  strengthBar: { flexDirection: 'row', gap: m3Spacing.xs },
  strengthSegment: { flex: 1, height: 4, borderRadius: m3Radii.full },
  rulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: m3Spacing.sm,
    marginTop: m3Spacing.sm,
  },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ruleText: { fontSize: m3Typography.labelSmall.fontSize - 1 },
  submitBtn: {
    height: m3TouchTarget.comfortable,
    borderRadius: m3Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: m3Spacing.lg,
  },
  submitText: { fontSize: m3Typography.bodyMedium.fontSize, fontWeight: '700' },
  footerRow: { flexDirection: 'row', alignItems: 'center', marginTop: m3Spacing.lg },
  footerText: { fontSize: m3Typography.bodySmall.fontSize },
  footerLink: { fontSize: m3Typography.bodySmall.fontSize, fontWeight: '600' },
});
