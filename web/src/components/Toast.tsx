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
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/* ───────── variant config ───────── */
const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: string; strip: string; bg: string; text: string }
> = {
  success: {
    icon: 'check_circle',
    strip: 'bg-m3-success',
    bg: 'bg-m3-surface-container-highest',
    text: 'text-m3-success',
  },
  error: {
    icon: 'error',
    strip: 'bg-m3-error',
    bg: 'bg-m3-surface-container-highest',
    text: 'text-m3-error',
  },
  warning: {
    icon: 'warning',
    strip: 'bg-m3-warning',
    bg: 'bg-m3-surface-container-highest',
    text: 'text-m3-warning',
  },
  info: {
    icon: 'info',
    strip: 'bg-m3-info',
    bg: 'bg-m3-surface-container-highest',
    text: 'text-m3-info',
  },
};

/* ───────── single toast item ───────── */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const cfg = VARIANT_CONFIG[toast.variant];
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const dur = toast.duration ?? 4000;
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 280);
    }, dur);
    return () => clearTimeout(timerRef.current);
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  return (
    <div
      role="alert"
      className={`
        flex items-center gap-3 rounded-2xl ${cfg.bg} elevation-2
        pl-0 pr-3 py-0 overflow-hidden min-w-75 max-w-105
        transition-standard
        ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      style={{ animation: exiting ? undefined : 'toast-in 0.3s cubic-bezier(0.2,0,0,1) forwards' }}
    >
      {/* Accent strip */}
      <div className={`${cfg.strip} w-1 self-stretch rounded-l-2xl shrink-0`} />

      {/* Icon */}
      <span className={`material-symbols-outlined text-[20px] ${cfg.text} shrink-0 py-3`}>
        {cfg.icon}
      </span>

      {/* Message */}
      <p className="text-m3-on-surface text-sm flex-1 py-3 leading-snug">{toast.message}</p>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                   hover:bg-m3-surface-container-high transition-standard"
      >
        <span className="material-symbols-outlined text-[18px] text-m3-on-surface-variant">
          close
        </span>
      </button>
    </div>
  );
}

/* ───────── provider ───────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
    },
    []
  );

  const success = useCallback((m: string) => showToast(m, 'success'), [showToast]);
  const error = useCallback((m: string) => showToast(m, 'error', 6000), [showToast]);
  const warning = useCallback((m: string) => showToast(m, 'warning', 5000), [showToast]);
  const info = useCallback((m: string) => showToast(m, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-9999 flex flex-col gap-2 items-end
                    max-sm:right-2 max-sm:left-2 max-sm:items-stretch"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
