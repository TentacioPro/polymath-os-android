'use client';

import React from 'react';

interface M3ProgressProps {
  variant?: 'circular' | 'linear';
  determinate?: boolean;
  value?: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const SIZE_MAP = { small: 24, medium: 40, large: 56 } as const;
const STROKE_MAP = { small: 2.5, medium: 3.5, large: 4 } as const;

export function M3Progress({
  variant = 'circular',
  determinate = false,
  value = 0,
  size = 'medium',
  color,
}: M3ProgressProps) {
  if (variant === 'linear') {
    return <LinearProgress determinate={determinate} value={value} color={color} />;
  }

  return (
    <CircularProgress
      determinate={determinate}
      value={value}
      size={size}
      color={color}
    />
  );
}

function CircularProgress({
  determinate,
  value,
  size,
  color,
}: {
  determinate: boolean;
  value: number;
  size: 'small' | 'medium' | 'large';
  color?: string;
}) {
  const dim = SIZE_MAP[size];
  const stroke = STROKE_MAP[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = determinate
    ? circumference * (1 - Math.min(Math.max(value, 0), 100) / 100)
    : circumference * 0.75;

  return (
    <div
      className={`m3-progress-circular ${!determinate ? 'm3-progress-circular--indeterminate' : ''}`}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          className="m3-progress-track"
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="m3-progress-fill"
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={color ? { stroke: color } : undefined}
        />
      </svg>

      <style jsx>{`
        .m3-progress-circular {
          display: inline-flex;
          transform: rotate(-90deg);
        }
        .m3-progress-circular--indeterminate {
          animation: m3-circular-rotate 1400ms linear infinite;
        }
        @keyframes m3-circular-rotate {
          from { transform: rotate(-90deg); }
          to { transform: rotate(270deg); }
        }
        .m3-progress-track {
          stroke: var(--m3-surface-container-high);
        }
        .m3-progress-fill {
          stroke: var(--m3-primary);
          transition: stroke-dashoffset 200ms cubic-bezier(0.2, 0, 0, 1);
        }
      `}</style>
    </div>
  );
}

function LinearProgress({
  determinate,
  value,
  color,
}: {
  determinate: boolean;
  value: number;
  color?: string;
}) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="m3-progress-linear">
      <div
        className={`m3-progress-linear-fill ${!determinate ? 'm3-progress-linear-fill--indeterminate' : ''}`}
        style={
          determinate
            ? { width: `${clampedValue}%`, ...(color ? { backgroundColor: color } : {}) }
            : color
            ? { backgroundColor: color }
            : undefined
        }
      />

      <style jsx>{`
        .m3-progress-linear {
          height: 4px;
          width: 100%;
          border-radius: 2px;
          background-color: var(--m3-surface-container-high);
          overflow: hidden;
          position: relative;
        }
        .m3-progress-linear-fill {
          height: 100%;
          border-radius: 2px;
          background-color: var(--m3-primary);
          transition: width 200ms cubic-bezier(0.2, 0, 0, 1);
        }
        .m3-progress-linear-fill--indeterminate {
          position: absolute;
          width: 30%;
          animation: m3-linear-slide 1200ms ease-in-out infinite;
        }
        @keyframes m3-linear-slide {
          0% {
            left: -30%;
            width: 30%;
          }
          50% {
            left: 30%;
            width: 60%;
          }
          100% {
            left: 100%;
            width: 30%;
          }
        }
      `}</style>
    </div>
  );
}

export default M3Progress;
