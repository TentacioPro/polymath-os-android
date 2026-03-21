'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/');
    } catch (err: any) {
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
          <h1 className="text-2xl font-bold text-m3-on-surface">Polymath OS</h1>
          <p className="text-sm text-m3-on-surface-variant mt-1">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-m3-surface-container border border-m3-outline-variant p-6 elevation-1"
        >
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-m3-error-container text-m3-error text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

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
          <div className="mb-6">
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
                placeholder="Enter password"
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-3.5 rounded-2xl bg-m3-primary text-m3-on-primary text-[15px] font-bold hover:opacity-90 transition-standard disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-m3-on-primary border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-m3-on-surface-variant mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-m3-primary font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
