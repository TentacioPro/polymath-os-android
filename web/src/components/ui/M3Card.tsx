import type { HTMLAttributes, ReactNode } from 'react';

type Elevation = 0 | 1 | 2 | 3;

interface M3CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  interactive?: boolean;
  children: ReactNode;
}

export default function M3Card({
  elevation = 0,
  interactive = false,
  className = '',
  children,
  ...props
}: M3CardProps) {
  return (
    <div
      className={`@container rounded-2xl bg-m3-surface-container border border-m3-outline-variant
        ${elevation > 0 ? `elevation-${elevation}` : ''}
        ${interactive ? 'cursor-pointer hover:bg-m3-surface-container-high active:scale-[0.99] transition-standard' : 'transition-standard'}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
