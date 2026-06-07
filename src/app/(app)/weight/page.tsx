'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { WeightChart } from '@/components/WeightChart';
import { todayISO, formatWeight } from '@/lib/utils';
import { api } from '@/lib/fetcher';

export default function WeightPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [note, setNote] = useState('');

  const { data: logs = [] } = useQuery({
    queryKey: ['weight-logs'],
    queryFn: () => api<any[]>('/api/weight?limit=90'),
  });
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api('/api/me'),
  });

  const save = useMutation({
    mutationFn: () => api('/api/weight', {
      method: 'POST',
      body: JSON.stringify({
        date,
        weight_kg: parseFloat(weight),
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        note: note || null,
      }),
    }),
    onSuccess: () => {
      setWeight(''); setBodyFat(''); setNote('');
      qc.invalidateQueries({ queryKey: ['weight-logs'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const normalized = logs.map((l: any) => ({ ...l, weight_kg: Number(l.weight_kg) }));
  const latest = normalized[0];

  return (
    <>
      <Header title="体重" showBack />
      <div className="p-4 space-y-4">

        <Card>
          <CardTitle>新規記録</CardTitle>
          <div className="space-y-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 px-4" />
            <input type="number" step="0.1" inputMode="decimal" placeholder="体重 (kg)"
              value={weight} onChange={e => setWeight(e.target.value)}
              className="w-full h-14 rounded-xl bg-slate-950 border border-slate-800 px-4 text-2xl tabular-nums text-center" />
            <input type="number" step="0.1" inputMode="decimal" placeholder="体脂肪率 % (任意)"
              value={bodyFat} onChange={e => setBodyFat(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 px-4" />
            <input type="text" placeholder="メモ (任意)"
              value={note} onChange={e => setNote(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 px-4" />
            <button onClick={() => save.mutate()} disabled={!weight || save.isPending}
              className="w-full h-12 rounded-xl bg-emerald-500 font-semibold disabled:opacity-50">
              {save.isPending ? '保存中…' : '記録する'}
            </button>
          </div>
        </Card>

        {latest && (
          <Card>
            <CardTitle>直近</CardTitle>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold tabular-nums">{formatWeight(latest.weight_kg)}</div>
                <div className="text-xs text-slate-400 mt-1">{latest.date}</div>
              </div>
              {profile && (
                <div className="text-right">
                  <div className="text-xs text-slate-400">目標まで</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {(Number((profile as any).goal_weight_kg) - latest.weight_kg).toFixed(1)} kg
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 -mx-2">
              <WeightChart logs={normalized} goalWeight={Number((profile as any)?.goal_weight_kg)} height={180} />
            </div>
          </Card>
        )}

        <Card>
          <CardTitle>履歴</CardTitle>
          <div className="divide-y divide-slate-800">
            {normalized.map((l: any) => (
              <div key={l.id} className="flex justify-between py-3">
                <div>
                  <div className="text-sm">{l.date}</div>
                  {l.note && <div className="text-xs text-slate-400 mt-0.5">{l.note}</div>}
                </div>
                <div className="text-right">
                  <div className="tabular-nums font-semibold">{l.weight_kg} kg</div>
                  {l.body_fat_pct && <div className="text-xs text-slate-400">体脂肪 {l.body_fat_pct}%</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
