'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface M3InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  supportingText?: string;
  /** Shows an animated loading spinner as the trailing slot */
  loading?: boolean;
  /** Shows a success checkmark + green border */
  success?: boolean;
}

export default function M3Input({
  label,
  icon,
  error,
  supportingText,
  loading = false,
  success = false,
  className = '',
  id,
  disabled,
  ...props
}: M3InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const borderCls = error
    ? 'border-m3-error focus-visible:border-m3-error focus-visible:ring-m3-error/30'
    : success
    ? 'border-m3-success focus-visible:border-m3-success focus-visible:ring-m3-success/30'
    : 'border-m3-outline-variant focus-visible:border-m3-primary focus-visible:ring-m3-primary/30';

  const disabledCls = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <div className={`${disabledCls} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium uppercase tracking-wider text-m3-on-surface-variant mb-1.5 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-m3-on-surface-variant flex items-center">
            {icon}
          </span>
        )}

        {/* Trailing slot: loading spinner or success icon */}
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-m3-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 014 12z" />
            </svg>
          </span>
        )}
        {!loading && success && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-success flex items-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error || supportingText ? `${inputId}-hint` : undefined}
          className={`w-full bg-m3-surface text-m3-on-surface text-[15px] rounded-2xl min-h-11
            border outline-none transition-standard
            placeholder:text-m3-on-surface-variant
            focus-visible:ring-2 focus-visible:ring-offset-0
            ${icon ? 'pl-10' : 'px-4'} ${loading || success ? 'pr-10' : 'pr-4'} py-3
            ${borderCls}`}
          {...props}
        />
      </div>
      {(error || supportingText) && (
        <p
          id={`${inputId}-hint`}
          className={`text-[11px] mt-1 ${error ? 'text-m3-error' : 'text-m3-on-surface-variant'}`}
        >
          {error || supportingText}
        </p>
      )}
    </div>
  );
}
