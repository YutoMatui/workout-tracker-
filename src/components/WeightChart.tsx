'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import type { WeightLog } from '@/lib/types';
import { movingAverage } from '@/lib/tdee';

export function WeightChart({
  logs, goalWeight, height = 220,
}: { logs: WeightLog[]; goalWeight?: number; height?: number }) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map(l => l.weight_kg);
  const ma = movingAverage(weights, 7);
  const data = sorted.map((l, i) => ({
    date: l.date.slice(5),
    weight: l.weight_kg,
    ma: ma[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#475569" tick={{ fontSize: 10 }} width={36} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
        />
        {goalWeight && (
          <ReferenceLine y={goalWeight} stroke="#10b981" strokeDasharray="3 3" label={{ value: '目標', fill: '#10b981', fontSize: 10 }} />
        )}
        <Line type="monotone" dataKey="weight" stroke="#64748b" strokeWidth={1.5} dot={{ r: 2 }} />
        <Line type="monotone" dataKey="ma" stroke="#10b981" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
