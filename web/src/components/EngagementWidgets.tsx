'use client';

import { useMemo } from 'react';

/* ─── Streak calculation ─── */
function computeStreak(timestamps: string[]): number {
  if (!timestamps.length) return 0;
  const days = new Set(
    timestamps.map((ts) => new Date(ts).toISOString().slice(0, 10))
  );
  const sorted = Array.from(days).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/* ─── Sparkline: last 7 days activity counts ─── */
function computeSparkline(timestamps: string[]): number[] {
  const counts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    counts.push(
      timestamps.filter((ts) => new Date(ts).toISOString().slice(0, 10) === day)
        .length
    );
  }
  return counts;
}

/* ─── Mini sparkline SVG ─── */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const w = 120;
  const h = 36;
  const pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--m3-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--m3-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#spark-fill)" />
      <path d={pathD} fill="none" stroke="var(--m3-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Latest dot */}
      {data.length > 0 && (
        <circle
          cx={w - pad}
          cy={h - pad - (data[data.length - 1] / max) * (h - pad * 2)}
          r="3"
          fill="var(--m3-primary)"
        />
      )}
    </svg>
  );
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getWeekDayLabels(): string[] {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
  }
  return labels;
}

/* ─── Component ─── */
interface EngagementWidgetsProps {
  activityTimestamps: string[];
  journalTimestamps: string[];
}

export default function EngagementWidgets({
  activityTimestamps,
  journalTimestamps,
}: EngagementWidgetsProps) {
  const allTimestamps = useMemo(
    () => [...activityTimestamps, ...journalTimestamps],
    [activityTimestamps, journalTimestamps]
  );

  const streak = useMemo(() => computeStreak(allTimestamps), [allTimestamps]);
  const sparkData = useMemo(
    () => computeSparkline(allTimestamps),
    [allTimestamps]
  );
  const weekLabels = useMemo(() => getWeekDayLabels(), []);
  const todayCount = sparkData[sparkData.length - 1] || 0;
  const weekTotal = sparkData.reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Streak Card */}
      <div className="p-4 rounded-2xl bg-m3-surface-container border border-m3-outline-variant flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[18px] text-m3-primary">
            local_fire_department
          </span>
          <span className="text-[10px] uppercase tracking-wider text-m3-on-surface-variant font-bold">
            Streak
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-bold text-m3-on-surface leading-none">
            {streak}
          </span>
          <span className="text-[11px] text-m3-on-surface-variant">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
        {streak > 0 && (
          <p className="text-[10px] text-m3-primary mt-2">
            {streak >= 7
              ? 'Incredible consistency!'
              : streak >= 3
              ? 'Building momentum'
              : 'Keep going!'}
          </p>
        )}
      </div>

      {/* Sparkline Card */}
      <div className="p-4 rounded-2xl bg-m3-surface-container border border-m3-outline-variant flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-m3-on-surface-variant font-bold">
            7-day Activity
          </span>
          <span className="text-[11px] font-bold text-m3-primary">{weekTotal}</span>
        </div>
        <Sparkline data={sparkData} />
        <div className="flex justify-between mt-1.5">
          {weekLabels.map((l, i) => (
            <span
              key={i}
              className={`text-[8px] ${
                i === weekLabels.length - 1
                  ? 'text-m3-primary font-bold'
                  : 'text-m3-on-surface-variant'
              }`}
            >
              {l}
            </span>
          ))}
        </div>
        {todayCount > 0 && (
          <p className="text-[10px] text-m3-on-surface-variant mt-1">
            {todayCount} today
          </p>
        )}
      </div>
    </div>
  );
}
