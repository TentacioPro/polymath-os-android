'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = 'filled' | 'tonal' | 'outlined' | 'text';

interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  iconTrailing?: ReactNode;
  loading?: boolean;
  /** Error state: errorContainer bg + alert icon */
  error?: boolean;
  /** Success state: successContainer bg + check icon */
  success?: boolean;
  children: ReactNode;
}

// ─── State-to-class maps ──────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<Variant, string> = {
  filled:
    'bg-m3-primary text-m3-on-primary ' +
    'hover:opacity-90 hover:scale-[1.02] ' +
    'active:scale-[0.97] ' +
    'focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2',
  tonal:
    'bg-m3-primary-container text-m3-on-primary-container ' +
    'hover:brightness-110 hover:scale-[1.02] ' +
    'active:scale-[0.97] ' +
    'focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2',
  outlined:
    'border border-m3-outline text-m3-on-surface ' +
    'hover:bg-m3-surface-container-high hover:scale-[1.02] ' +
    'active:scale-[0.97] ' +
    'focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2',
  text:
    'text-m3-primary ' +
    'hover:bg-m3-primary-container/30 hover:scale-[1.02] ' +
    'active:scale-[0.97] ' +
    'focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2',
};

const ERROR_CLASSES =
  'bg-[var(--m3-error-container)] text-[var(--m3-on-error)] ' +
  'hover:opacity-90 active:scale-[0.97] ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--m3-error)] focus-visible:ring-offset-2';

const SUCCESS_CLASSES =
  'bg-[var(--m3-success-container)] text-[var(--m3-success)] ' +
  'hover:opacity-90 active:scale-[0.97] ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--m3-success)] focus-visible:ring-offset-2';

// ─── Component ────────────────────────────────────────────────────────────────

export default function M3Button({
  variant = 'filled',
  icon,
  iconTrailing,
  loading,
  error,
  success,
  disabled,
  className = '',
  children,
  ...props
}: M3ButtonProps) {
  // Resolve state classes
  let stateClasses: string;
  if (error) stateClasses = ERROR_CLASSES;
  else if (success) stateClasses = SUCCESS_CLASSES;
  else stateClasses = VARIANT_CLASSES[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full min-h-[44px]
        text-sm font-semibold
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:pointer-events-none disabled:grayscale
        focus-visible:outline-none
        ${stateClasses}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {/* Loading */}
      {loading && (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}

      {/* Error icon */}
      {!loading && error && (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      )}

      {/* Success icon */}
      {!loading && !error && success && (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.59L5.41 12 6.83 10.58 10 13.75l7.17-7.17 1.42 1.42L10 16.59z" />
        </svg>
      )}

      {/* Default icon */}
      {!loading && !error && !success && icon}

      {children}

      {/* Trailing icon (not shown in loading/error/success) */}
      {!loading && !error && !success && iconTrailing}
    </button>
  );
}
