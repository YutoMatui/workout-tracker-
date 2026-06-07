'use client';

export function CalorieRing({
  consumed,
  target,
  size = 180,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1.2) : 0;
  const remaining = target - consumed;
  const r = (size - 24) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(pct, 1));

  const color = pct < 0.7 ? '#f59e0b' : pct <= 1.05 ? '#10b981' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={12} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={12} fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold tabular-nums">{Math.round(consumed)}</div>
        <div className="text-xs text-slate-400">/ {target} kcal</div>
        <div className={`text-xs mt-1 ${remaining > 0 ? 'text-slate-300' : 'text-red-400'}`}>
          {remaining > 0 ? `残り ${Math.round(remaining)}` : `+${Math.round(-remaining)} 超過`}
        </div>
      </div>
    </div>
  );
}
