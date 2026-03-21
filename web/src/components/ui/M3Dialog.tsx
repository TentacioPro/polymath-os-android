'use client';

import React, { useEffect, useCallback } from 'react';

interface M3DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'filled' | 'destructive';
}

interface M3DialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
  icon?: React.ReactNode;
  actions: M3DialogAction[];
}

export function M3Dialog({
  visible,
  onClose,
  title,
  body,
  icon,
  actions,
}: M3DialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  return (
    <div
      className="m3-dialog-wrapper"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'm3-dialog-title' : undefined}
    >
      <div className="m3-dialog-scrim glass-overlay" onClick={onClose} aria-hidden="true" />
      <div className="m3-dialog-content">
        {icon && <div className="m3-dialog-icon">{icon}</div>}
        {title && <h2 id="m3-dialog-title" className="m3-dialog-title">{title}</h2>}
        {body && <p className="m3-dialog-body">{body}</p>}
        {actions.length > 0 && (
          <div className="m3-dialog-actions">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`m3-dialog-btn m3-dialog-btn--${action.variant || 'text'}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .m3-dialog-wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 70;
        }
        .m3-dialog-scrim {
          position: absolute;
          inset: 0;
          animation: scrim-fade-in 200ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        @keyframes scrim-fade-in {
          from { opacity: 0; }
          to { opacity: 0.6; }
        }
        .m3-dialog-content {
          position: relative;
          width: 85%;
          max-width: 400px;
          background-color: var(--m3-surface-container-highest);
          border-radius: 28px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: dialog-scale-in 500ms cubic-bezier(0.05, 0.7, 0.1, 1) forwards;
        }
        @keyframes dialog-scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .m3-dialog-icon {
          margin-bottom: 16px;
          color: var(--m3-primary);
        }
        .m3-dialog-title {
          font-size: 24px;
          font-weight: 400;
          line-height: 32px;
          text-align: center;
          margin: 0 0 16px 0;
          color: var(--m3-on-surface);
        }
        .m3-dialog-body {
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          text-align: center;
          margin: 0 0 24px 0;
          color: var(--m3-on-surface-variant);
        }
        .m3-dialog-actions {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          gap: 8px;
          width: 100%;
        }
        .m3-dialog-btn {
          padding: 8px 24px;
          border-radius: 9999px;
          min-width: 64px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.1px;
          cursor: pointer;
          border: none;
          transition: all 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .m3-dialog-btn--text {
          background: transparent;
          color: var(--m3-primary);
        }
        .m3-dialog-btn--text:hover {
          background: var(--m3-primary-container);
        }
        .m3-dialog-btn--filled {
          background: var(--m3-primary);
          color: var(--m3-on-primary);
        }
        .m3-dialog-btn--filled:hover {
          opacity: 0.9;
        }
        .m3-dialog-btn--destructive {
          background: var(--m3-error-container);
          color: var(--m3-error);
        }
        .m3-dialog-btn--destructive:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

export default M3Dialog;
