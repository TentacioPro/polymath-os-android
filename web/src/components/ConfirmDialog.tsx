'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/* ───────── types ───────── */
interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  icon?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

/* ───────── provider ───────── */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<
    (ConfirmOptions & { resolve: (value: boolean) => void }) | null
  >(null);
  const [visible, setVisible] = useState(false);
  const scrimRef = useRef<HTMLDivElement>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
      // Allow DOM to mount before animating in
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleResult = useCallback(
    (result: boolean) => {
      setVisible(false);
      setTimeout(() => {
        state?.resolve(result);
        setState(null);
      }, 200);
    },
    [state]
  );

  // Close on Escape
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleResult(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, handleResult]);

  const isDanger = state?.variant === 'danger';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state && (
        <div
          ref={scrimRef}
          className={`fixed inset-0 z-[9998] flex items-center justify-center p-4
                      transition-standard
                      ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: 'var(--m3-scrim)' }}
          onClick={(e) => e.target === scrimRef.current && handleResult(false)}
        >
          <div
            className={`bg-m3-surface-container-highest rounded-3xl w-full max-w-[380px]
                        elevation-3 transition-standard
                        ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* Icon */}
            {state.icon && (
              <div className="flex justify-center pt-6">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDanger ? 'bg-m3-error-container' : 'bg-m3-primary-container'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[24px] ${
                      isDanger ? 'text-m3-error' : 'text-m3-primary'
                    }`}
                  >
                    {state.icon}
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <h2
              className={`text-m3-on-surface text-lg font-medium text-center px-6 ${
                state.icon ? 'pt-4' : 'pt-6'
              }`}
            >
              {state.title}
            </h2>

            {/* Message */}
            <p className="text-m3-on-surface-variant text-sm text-center px-6 pt-3 leading-relaxed">
              {state.message}
            </p>

            {/* Actions */}
            <div className="flex gap-2 justify-end px-6 pt-6 pb-6">
              <button
                onClick={() => handleResult(false)}
                className="px-5 py-2.5 rounded-full text-sm font-medium
                           text-m3-on-surface hover:bg-m3-surface-container-high
                           transition-standard"
              >
                {state.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handleResult(true)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-standard
                  ${
                    isDanger
                      ? 'bg-m3-error text-m3-on-error hover:opacity-90'
                      : 'bg-m3-primary text-m3-on-primary hover:opacity-90'
                  }`}
              >
                {state.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
