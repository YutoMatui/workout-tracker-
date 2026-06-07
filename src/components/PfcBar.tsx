'use client';

export function PfcBar({
  p, f, c, pT, fT, cT,
}: {
  p: number; f: number; c: number;
  pT: number; fT: number; cT: number;
}) {
  const rows = [
    { label: 'P', val: p, target: pT, color: 'bg-rose-500' },
    { label: 'F', val: f, target: fT, color: 'bg-amber-500' },
    { label: 'C', val: c, target: cT, color: 'bg-sky-500' },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map(r => {
        const pct = r.target > 0 ? Math.min(r.val / r.target, 1.2) * 100 : 0;
        return (
          <div key={r.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{r.label}</span>
              <span className="tabular-nums text-slate-300">{Math.round(r.val)} / {r.target}g</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${r.color}`} style={{ width: `${Math.min(pct, 100)}%`, transition: 'width 0.5s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
