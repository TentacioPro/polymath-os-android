'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 12, label: '12+ characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'Lowercase letter' },
  { test: (p: string) => /\d/.test(p), label: 'Number' },
  { test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(p), label: 'Special character' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const passwordValid = passwordStrength === PASSWORD_RULES.length;
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !passwordValid || !confirmValid) return;
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
      router.replace('/');
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-m3-surface">
        <div className="w-6 h-6 border-2 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-m3-surface p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-m3-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-m3-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              neurology
            </span>
          </div>
          <h1 className="text-2xl font-bold text-m3-on-surface">Create Account</h1>
          <p className="text-sm text-m3-on-surface-variant mt-1">Join Polymath OS</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleRegister}
          className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant p-6 elevation-1"
        >
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-m3-error-container text-m3-error text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Display Name */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1.5">
              DISPLAY NAME <span className="text-m3-on-surface-variant/50">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-m3-on-surface-variant">
                person
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 text-[15px] text-m3-on-surface rounded-2xl border border-m3-outline-variant bg-m3-surface outline-none focus:border-m3-primary transition-standard placeholder:text-m3-on-surface-variant"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1.5">
              EMAIL
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-m3-on-surface-variant">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3 text-[15px] text-m3-on-surface rounded-2xl border border-m3-outline-variant bg-m3-surface outline-none focus:border-m3-primary transition-standard placeholder:text-m3-on-surface-variant"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-m3-on-surface-variant">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-12 py-3 text-[15px] text-m3-on-surface rounded-2xl border border-m3-outline-variant bg-m3-surface outline-none focus:border-m3-primary transition-standard placeholder:text-m3-on-surface-variant"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface transition-standard"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password.length > 0 && (
            <div className="mb-4">
              {/* Strength bar */}
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-standard ${
                      i <= passwordStrength
                        ? passwordStrength <= 2
                          ? 'bg-m3-error'
                          : passwordStrength <= 4
                          ? 'bg-m3-warning'
                          : 'bg-m3-success'
                        : 'bg-m3-outline-variant'
                    }`}
                  />
                ))}
              </div>
              {/* Rules */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <span
                    key={rule.label}
                    className={`text-[10px] flex items-center gap-0.5 ${
                      rule.test(password) ? 'text-m3-success' : 'text-m3-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {rule.test(password) ? 'check_circle' : 'circle'}
                    </span>
                    {rule.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-medium text-m3-on-surface-variant tracking-wide mb-1.5">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-m3-on-surface-variant">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
                className={`w-full pl-10 pr-10 py-3 text-[15px] text-m3-on-surface rounded-2xl border bg-m3-surface outline-none transition-standard placeholder:text-m3-on-surface-variant ${
                  confirmPassword.length > 0 && !confirmValid
                    ? 'border-m3-error'
                    : 'border-m3-outline-variant focus:border-m3-primary'
                }`}
              />
              {confirmPassword.length > 0 && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] ${
                    confirmValid ? 'text-m3-success' : 'text-m3-error'
                  }`}
                >
                  {confirmValid ? 'check_circle' : 'cancel'}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !passwordValid || !confirmValid}
            className="w-full py-3.5 rounded-2xl bg-m3-primary text-m3-on-primary text-[15px] font-bold hover:opacity-90 transition-standard disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-m3-on-primary border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-m3-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-m3-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
