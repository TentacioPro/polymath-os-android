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
      className="fixed inset-0 bg-[var(--poly-overlay)] backdrop-blur-sm flex z-50 items-end md:items-center justify-center md:p-6"
      onClick={onClose}
    >
      <div
        className={`bg-poly-bg w-full ${maxWidth} border-t md:border border-poly-border p-6 max-h-[90vh] overflow-y-auto md:[box-shadow:6px_6px_0px_var(--poly-shadow)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-poly-text uppercase">
            {title}
          </h2>
          <button onClick={onClose}>
            <span className="material-symbols-outlined text-[24px] text-poly-muted hover:text-poly-text transition-colors">
              close
            </span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
