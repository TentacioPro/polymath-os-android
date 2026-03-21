'use client';

import React from 'react';

interface M3SwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function M3Switch({
  value,
  onValueChange,
  disabled = false,
  label,
}: M3SwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <div
      className={`m3-switch-container ${disabled ? 'm3-switch-container--disabled' : ''}`}
      onClick={handleClick}
    >
      <div className={`m3-switch-track ${value ? 'm3-switch-track--on' : ''}`}>
        <div className={`m3-switch-thumb ${value ? 'm3-switch-thumb--on' : ''}`}>
          {value && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="m3-switch-label">{label}</span>}

      <style jsx>{`
        .m3-switch-container {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          user-select: none;
        }
        .m3-switch-container--disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .m3-switch-track {
          width: 52px;
          height: 32px;
          border-radius: 16px;
          background-color: var(--m3-surface-container-high);
          position: relative;
          transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .m3-switch-track--on {
          background-color: var(--m3-primary);
        }
        .m3-switch-thumb {
          position: absolute;
          top: 50%;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--m3-outline);
          transform: translateY(-50%) translateX(4px);
          transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--m3-primary);
        }
        .m3-switch-thumb--on {
          width: 28px;
          height: 28px;
          background-color: var(--m3-on-primary);
          transform: translateY(-50%) translateX(22px);
        }
        .m3-switch-label {
          font-size: 14px;
          color: var(--m3-on-surface);
        }
      `}</style>
    </div>
  );
}

export default M3Switch;
