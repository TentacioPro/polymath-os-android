'use client';

import { ReactNode } from 'react';

interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** max-w class for desktop. Defaults to 'max-w-xl' */
  maxWidth?: string;
}

export default function ResponsiveModal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
}: ResponsiveModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 glass-overlay flex z-50 items-end md:items-center justify-center md:p-6"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="responsive-modal-title"
        className={`bg-m3-surface-container w-full ${maxWidth} border-t md:border border-m3-outline-variant p-6 max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl elevation-3`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="responsive-modal-title" className="text-lg font-bold text-m3-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-m3-surface-container-high transition-standard"
          >
            <span className="material-symbols-outlined text-[24px] text-m3-on-surface-variant hover:text-m3-on-surface transition-standard" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
