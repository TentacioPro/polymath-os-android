'use client';

import React, { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  visible: boolean;
  message?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function SuccessAnimation({
  visible,
  message = 'Success!',
  onDismiss,
  autoDismissMs = 1500,
}: SuccessAnimationProps) {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setLeaving(false);
      const timer = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          setShow(false);
          onDismiss();
        }, 300);
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismissMs, onDismiss]);

  if (!show) return null;

  return (
    <div className={`success-overlay ${leaving ? 'leaving' : ''}`}>
      <div className="check-circle">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="message">{message}</p>

      <style jsx>{`
        .success-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          z-index: 9999;
          animation: overlayIn 200ms ease;
        }
        .success-overlay.leaving {
          animation: overlayOut 300ms ease forwards;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes overlayOut { from { opacity: 1; } to { opacity: 0; } }
        .check-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--m3-primary);
          color: var(--m3-on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .message {
          margin-top: 20px;
          font-size: 16px;
          font-weight: 600;
          color: var(--m3-on-surface);
          animation: fadeUp 300ms ease 200ms both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
