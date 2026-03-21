import type { InputHTMLAttributes } from 'react';

interface M3InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  supportingText?: string;
}

export default function M3Input({
  label,
  icon,
  error,
  supportingText,
  className = '',
  id,
  ...props
}: M3InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium uppercase tracking-wider text-m3-on-surface-variant mb-1.5 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined text-[20px] text-m3-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-m3-surface text-m3-on-surface text-[15px] rounded-2xl
            border outline-none transition-standard
            placeholder:text-m3-on-surface-variant
            ${icon ? 'pl-10 pr-4' : 'px-4'} py-3
            ${error ? 'border-m3-error focus:border-m3-error' : 'border-m3-outline-variant focus:border-m3-primary'}`}
          {...props}
        />
      </div>
      {(error || supportingText) && (
        <p className={`text-[11px] mt-1 ${error ? 'text-m3-error' : 'text-m3-on-surface-variant'}`}>
          {error || supportingText}
        </p>
      )}
    </div>
  );
}
