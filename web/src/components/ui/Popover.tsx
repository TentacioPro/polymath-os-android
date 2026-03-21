'use client';

import React, { useRef, useEffect } from 'react';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  /** Which edge of the anchor to align the popover to. Default: right */
  align?: 'left' | 'right';
}

/**
 * Non-blocking Popover — anchors to a trigger element.
 * No scrim. Dismisses on outside click or Escape.
 * Per Hick's Law: use for simple (non-destructive) actions only.
 */
export function Popover({ open, onClose, anchorRef, children, align = 'right' }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const rect = anchorRef.current.getBoundingClientRect();
  const top = rect.bottom + 4;
  const left = align === 'right' ? rect.right - 176 : rect.left;

  return (
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top, left, zIndex: 9000 }}
      className="w-44 rounded-2xl bg-m3-surface-container-highest border border-m3-outline-variant shadow-xl py-1 animate-scale-in"
      role="menu"
      aria-modal="false"
    >
      {children}
    </div>
  );
}

interface PopoverItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export function PopoverItem({ icon, label, onClick, variant = 'default' }: PopoverItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] font-medium transition-standard hover:bg-m3-surface-container-high ${
        variant === 'danger' ? 'text-m3-error' : 'text-m3-on-surface'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[18px] ${
          variant === 'danger' ? 'text-m3-error' : 'text-m3-on-surface-variant'
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
