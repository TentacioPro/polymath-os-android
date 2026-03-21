'use client';

import React from 'react';

interface M3ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'filter' | 'suggestion' | 'input';
}

export function M3Chip({
  label,
  selected = false,
  onClick,
  icon,
  variant = 'filter',
}: M3ChipProps) {
  const isClickable = !!onClick;

  return (
    <button
      type="button"
      className={`m3-chip ${selected ? 'm3-chip--selected' : ''} ${isClickable ? 'm3-chip--clickable' : ''}`}
      onClick={onClick}
      disabled={!isClickable}
    >
      {selected && variant === 'filter' && (
        <svg
          className="m3-chip-check"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 8L6.5 11.5L13 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {icon && !selected && <span className="m3-chip-icon">{icon}</span>}
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
          color: var(--m3-on-surface);
          font-size: 14px;
          font-weight: 500;
          cursor: default;
          transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
        }
        .m3-chip--clickable {
          cursor: pointer;
        }
        .m3-chip--clickable:hover {
          background-color: var(--m3-surface-container-highest);
        }
        .m3-chip--selected {
          background-color: var(--m3-primary-container);
          color: var(--m3-on-primary-container);
          border-color: transparent;
        }
        .m3-chip--selected.m3-chip--clickable:hover {
          opacity: 0.9;
        }
        .m3-chip:disabled {
          cursor: default;
        }
        .m3-chip-check {
          flex-shrink: 0;
        }
        .m3-chip-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .m3-chip-label {
          white-space: nowrap;
        }
      `}</style>
    </button>
  );
}

export default M3Chip;
