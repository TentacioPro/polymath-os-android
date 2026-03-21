import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text';

interface M3ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: string;
  iconTrailing?: string;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  filled:
    'bg-m3-primary text-m3-on-primary hover:opacity-90',
  tonal:
    'bg-m3-primary-container text-m3-on-primary-container hover:brightness-110',
  outlined:
    'border border-m3-outline text-m3-on-surface hover:bg-m3-surface-container-high',
  text:
    'text-m3-primary hover:bg-m3-primary-container/30',
};

export default function M3Button({
  variant = 'filled',
  icon,
  iconTrailing,
  loading,
  disabled,
  className = '',
  children,
  ...props
}: M3ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
        text-sm font-medium transition-standard disabled:opacity-50 disabled:pointer-events-none
        active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {iconTrailing && !loading && (
        <span className="material-symbols-outlined text-[18px]">{iconTrailing}</span>
      )}
    </button>
  );
}
