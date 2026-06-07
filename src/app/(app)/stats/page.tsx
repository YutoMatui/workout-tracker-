'use client';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { WeightChart } from '@/components/WeightChart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { epley1RM } from '@/lib/tdee';
import { format, startOfWeek } from 'date-fns';
import { api } from '@/lib/fetcher';

export default function StatsPage() {
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api<any>('/api/stats'),
  });

  if (!data) return <Header title="統計" showBack />;

  const weights = data.weights.map((w: any) => ({ ...w, weight_kg: Number(w.weight_kg) }));

  const exerciseMax = new Map<string, number>();
  data.sets.forEach((s: any) => {
    if (s.is_warmup) return;
    const name = s.exercises?.name_jp;
    if (!name) return;
    const e1rm = epley1RM(Number(s.weight_kg), s.reps);
    if (e1rm > (exerciseMax.get(name) ?? 0)) exerciseMax.set(name, e1rm);
  });
  const topExercises = Array.from(exerciseMax.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, e1rm]) => ({ name, e1rm }));

  const weeklyVolume = new Map<string, Record<string, number>>();
  data.sets.forEach((s: any) => {
    if (s.is_warmup) return;
    const week = format(startOfWeek(new Date(s.workouts.date), { weekStartsOn: 1 }), 'M/d');
    const group = s.exercises?.muscle_group ?? 'other';
    if (!weeklyVolume.has(week)) weeklyVolume.set(week, {});
    const ex = weeklyVolume.get(week)!;
    ex[group] = (ex[group] ?? 0) + Number(s.weight_kg) * s.reps;
  });
  const volumeData = Array.from(weeklyVolume.entries())
    .slice(-6)
    .map(([week, v]) => ({ week, ...v }));

  return (
    <>
      <Header title="統計" showBack />
      <div className="p-4 space-y-4">
        <Card>
          <CardTitle>体重推移 (90日)</CardTitle>
          <div className="-mx-2 mt-2">
            <WeightChart logs={weights} goalWeight={data.profile?.goal_weight_kg ? Number(data.profile.goal_weight_kg) : undefined} height={200} />
          </div>
        </Card>

        <Card>
          <CardTitle>種目別 e1RM (推定1RM)</CardTitle>
          <div className="space-y-2 mt-2">
            {topExercises.map(ex => (
              <div key={ex.name} className="flex justify-between items-center py-1.5 border-b border-slate-800 last:border-0">
                <span className="text-sm">{ex.name}</span>
                <span className="tabular-nums font-bold text-emerald-400">{ex.e1rm} kg</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>週間ボリューム (kg)</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={volumeData}>
              <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="chest" stackId="a" fill="#f43f5e" />
              <Bar dataKey="back" stackId="a" fill="#3b82f6" />
              <Bar dataKey="legs" stackId="a" fill="#10b981" />
              <Bar dataKey="shoulders" stackId="a" fill="#f59e0b" />
              <Bar dataKey="arms" stackId="a" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
