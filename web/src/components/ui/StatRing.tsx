import React from 'react';

interface StatRingProps {
  value: number;
  max: number;
  label: string;
  size?: number;
  color?: string;
}

export function StatRing({
  value,
  max,
  label,
  size = 80,
  color,
}: StatRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="stat-ring-container">
      <div className="stat-ring-wrapper" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            className="stat-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <circle
            className="stat-ring-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={color ? { stroke: color } : undefined}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="stat-ring-center">
          <span className="stat-ring-value">{value}</span>
        </div>
      </div>
      <span className="stat-ring-label">{label}</span>

      <style jsx>{`
        .stat-ring-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          container-type: inline-size;
        }
        .stat-ring-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-ring-track {
          stroke: var(--m3-surface-container-high);
        }
        .stat-ring-fill {
          stroke: var(--m3-primary);
          transition: stroke-dashoffset 300ms cubic-bezier(0.2, 0, 0, 1);
        }
        .stat-ring-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-ring-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--m3-on-surface);
        }
        .stat-ring-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--m3-on-surface-variant);
        }
      `}</style>
    </div>
  );
}

export default StatRing;
