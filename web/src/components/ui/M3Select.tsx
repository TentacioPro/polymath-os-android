'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface M3SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface M3SelectProps {
  options: M3SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function M3Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: M3SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        } else if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          close();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Escape':
        close();
        break;
    }
  };

  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, open]);

  return (
    <div ref={containerRef} className={`m3-select-root ${className}`} style={{ position: 'relative' }}>
      {label && (
        <label className="m3-select-label">{label}</label>
      )}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        className={`m3-select-trigger ${open ? 'm3-select-trigger--open' : ''} ${disabled ? 'm3-select-trigger--disabled' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        <span className="m3-select-value">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`m3-select-chevron ${open ? 'm3-select-chevron--open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="m3-select-menu"
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`m3-select-item ${opt.value === value ? 'm3-select-item--selected' : ''} ${i === focusedIndex ? 'm3-select-item--focused' : ''}`}
              onClick={() => {
                onChange(opt.value);
                close();
              }}
              onMouseEnter={() => setFocusedIndex(i)}
            >
              {opt.icon && <span className="m3-select-item-icon">{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.value === value && (
                <svg className="m3-select-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .m3-select-root {
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          min-width: 160px;
        }
        .m3-select-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--m3-on-surface-variant);
          padding-left: 4px;
        }
        .m3-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 16px;
          background: var(--m3-surface-container-high);
          border: 1px solid var(--m3-outline-variant);
          border-radius: 9999px;
          color: var(--m3-on-surface);
          font-size: 14px;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
          outline: none;
        }
        .m3-select-trigger:hover {
          background: var(--m3-surface-container-highest);
        }
        .m3-select-trigger:focus-visible {
          border-color: var(--m3-primary);
          box-shadow: 0 0 0 1px var(--m3-primary);
        }
        .m3-select-trigger--open {
          border-color: var(--m3-primary);
        }
        .m3-select-trigger--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .m3-select-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .m3-select-chevron {
          flex-shrink: 0;
          color: var(--m3-on-surface-variant);
          transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .m3-select-chevron--open {
          transform: rotate(180deg);
        }
        .m3-select-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          padding: 4px 0;
          background: var(--m3-surface-container-highest);
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1);
          list-style: none;
          z-index: 50;
          max-height: 256px;
          overflow-y: auto;
          animation: m3-select-in 150ms cubic-bezier(0, 0, 0, 1);
        }
        @keyframes m3-select-in {
          from {
            opacity: 0;
            transform: scaleY(0.92) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scaleY(1) translateY(0);
          }
        }
        .m3-select-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 14px;
          color: var(--m3-on-surface);
          cursor: pointer;
          transition: background 100ms;
        }
        .m3-select-item:hover,
        .m3-select-item--focused {
          background: var(--m3-primary-container);
          color: var(--m3-on-primary-container);
        }
        .m3-select-item--selected {
          font-weight: 500;
        }
        .m3-select-item-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .m3-select-check {
          margin-left: auto;
          color: var(--m3-primary);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
