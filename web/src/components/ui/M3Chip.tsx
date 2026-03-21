'use client';

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface M3ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'filter' | 'suggestion' | 'input';
  /** Disabled state — 0.5 opacity, grayscale, no interaction */
  disabled?: boolean;
  /** Loading state — spinner replaces icon */
  loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function M3Chip({
  label,
  selected = false,
  onClick,
  icon,
  variant = 'filter',
  disabled = false,
  loading = false,
}: M3ChipProps) {
  const isClickable = !!onClick && !disabled && !loading;

  return (
    <button
      type="button"
      className={[
        'm3-chip',
        selected ? 'm3-chip--selected' : '',
        isClickable ? 'm3-chip--clickable' : '',
        disabled ? 'm3-chip--disabled' : '',
        loading ? 'm3-chip--loading' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled || loading || !onClick}
      aria-pressed={isClickable ? selected : undefined}
      aria-selected={selected}
      aria-label={label}
    >
      {/* Loading spinner */}
      {loading && (
        <svg className="m3-chip-spinner" viewBox="0 0 24 24" fill="none">
          <circle className="m3-chip-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
      )}

      {/* Checkmark for selected filter chips */}
      {!loading && selected && variant === 'filter' && (
        <svg className="m3-chip-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Icon */}
      {!loading && !(selected && variant === 'filter') && icon && (
        <span className="m3-chip-icon">{icon}</span>
      )}

      <span className="m3-chip-label">{label}</span>

      <style jsx>{`
        .m3-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 32px;
          padding: 0 16px;
          border-radius: 9999px;
          border: 1px solid var(--m3-outline-variant);
          background-color: var(--m3-surface-container-high);
          color: var(--m3-on-surface-variant);
          font-size: 14px;
          font-weight: 500;
          cursor: default;
          transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
          outline: none;
          white-space: nowrap;
        }
        /* Clickable chips: meet WCAG 2.5.5 44×44px touch target */
        .m3-chip--clickable {
          cursor: pointer;
          min-height: 44px;
          height: auto;
          padding-block: 6px;
        }
        .m3-chip--clickable:hover {
          background-color: var(--m3-surface-container-highest);
          transform: scale(1.02);
        }
        .m3-chip--clickable:active {
          transform: scale(0.97);
        }
        .m3-chip--clickable:focus-visible {
          outline: 2px solid var(--m3-primary);
          outline-offset: 2px;
        }
        /* Selected */
        .m3-chip--selected {
          background-color: var(--m3-primary-container);
          color: var(--m3-on-primary-container);
          border-color: transparent;
        }
        .m3-chip--selected.m3-chip--clickable:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        /* Disabled */
        .m3-chip--disabled {
          opacity: 0.5;
          filter: grayscale(0.4);
          cursor: not-allowed;
        }
        /* Loading */
        .m3-chip--loading {
          cursor: wait;
          opacity: 0.8;
        }
        /* Icons */
        .m3-chip-check, .m3-chip-icon { display: flex; align-items: center; flex-shrink: 0; }
        .m3-chip-label { white-space: nowrap; }
        /* Spinner */
        .m3-chip-spinner {
          width: 14px;
          height: 14px;
          animation: chip-spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        .m3-chip-spinner-track { opacity: 0.25; }
        @keyframes chip-spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}

export default M3Chip;
