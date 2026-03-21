'use client';

import React, { useEffect, useState, useRef } from 'react';

type AIState = 'processing' | 'result' | 'error';

interface AIProgressProps {
  state?: AIState;
  steps?: string[];
  currentStep?: number;
  resultCount?: number;
  resultSummary?: string;
  errorMessage?: string;
  onView?: () => void;
  onRetry?: () => void;
}

export function AIProgress({
  state = 'processing',
  steps = ['Analyzing content...', 'Finding patterns...', 'Building connections...'],
  currentStep = 0,
  resultCount,
  resultSummary,
  errorMessage,
  onView,
  onRetry,
}: AIProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (state === 'processing') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, [state]);

  return (
    <div className="ai-progress">
      {state === 'processing' && (
        <>
          <div className="header-row">
            <div className="sparkle-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="header-text">
              <span className="title">AI Processing</span>
              <span className="elapsed">{elapsed}s</span>
            </div>
          </div>
          <p className="step-text" key={currentStep}>{steps[currentStep] || steps[0]}</p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>
          <div className="dots">
            {steps.map((_, i) => (
              <span key={i} className={`dot ${i <= currentStep ? 'active' : ''}`} />
            ))}
          </div>
        </>
      )}

      {state === 'result' && (
        <div className="result-content">
          <div className="result-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            <span>Generated {resultCount} connection{resultCount !== 1 ? 's' : ''}</span>
          </div>
          {resultSummary && <p className="result-summary">{resultSummary}</p>}
          {onView && <button className="view-link" onClick={onView}>View</button>}
        </div>
      )}

      {state === 'error' && (
        <div className="error-content">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="error-icon"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/></svg>
          <p className="error-text">{errorMessage || 'Something went wrong'}</p>
          {onRetry && <button className="retry-link" onClick={onRetry}>Retry</button>}
        </div>
      )}

      <style jsx>{`
        .ai-progress {
          background: var(--m3-surface-container);
          border-radius: 28px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .header-row { display: flex; align-items: center; gap: 12px; }
        .sparkle-icon {
          color: var(--m3-primary);
          animation: sparkle-rotate 3s linear infinite;
        }
        @keyframes sparkle-rotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .header-text { display: flex; align-items: center; justify-content: space-between; flex: 1; }
        .title { font-size: 16px; font-weight: 600; color: var(--m3-on-surface); }
        .elapsed { font-size: 11px; color: var(--m3-on-surface-variant); }
        .step-text {
          font-size: 14px; color: var(--m3-on-surface-variant); margin: 0;
          animation: fadeIn 300ms ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .progress-track {
          height: 4px; border-radius: 2px; overflow: hidden;
          background: var(--m3-surface-container-high);
        }
        .progress-fill {
          height: 100%; border-radius: 2px; background: var(--m3-primary);
          transition: width 400ms ease;
        }
        .dots { display: flex; gap: 6px; justify-content: center; }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--m3-surface-container-high);
          transition: background 200ms;
        }
        .dot.active { background: var(--m3-primary); }
        .result-content {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          animation: fadeIn 300ms ease;
        }
        .result-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 9999px;
          background: var(--m3-primary-container);
          color: var(--m3-on-primary-container);
          font-weight: 600;
        }
        .result-summary { font-size: 14px; color: var(--m3-on-surface-variant); text-align: center; margin: 0; }
        .view-link {
          background: none; border: none; color: var(--m3-primary);
          font-weight: 600; cursor: pointer; font-size: 14px;
        }
        .error-content {
          display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0;
          animation: fadeIn 300ms ease;
        }
        .error-icon { color: var(--m3-error); }
        .error-text { font-size: 14px; color: var(--m3-error); text-align: center; margin: 0; }
        .retry-link {
          background: none; border: none; color: var(--m3-primary);
          font-weight: 600; cursor: pointer; font-size: 14px;
        }
      `}</style>
    </div>
  );
}
