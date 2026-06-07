'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { todayISO } from '@/lib/utils';
import { api } from '@/lib/fetcher';

export default function WorkoutListPage() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => api<any[]>('/api/workouts'),
  });

  const start = useMutation({
    mutationFn: () => api<any>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify({ date: todayISO(), name: 'ワークアウト' }),
    }),
    onSuccess: (w: any) => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      if (w) router.push(`/workout/${w.id}`);
    },
  });

  return (
    <>
      <Header title="トレーニング" showBack />
      <div className="p-4 space-y-4">

        <button onClick={() => start.mutate()} disabled={start.isPending}
          className="w-full h-16 rounded-2xl bg-emerald-500 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50">
          <Plus className="w-5 h-5" /> 新規開始
        </button>

        <Card>
          <CardTitle>履歴</CardTitle>
          {data.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-6">まだ記録なし</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {data.map((w: any) => {
                const exercises = Array.from(new Set((w.sets ?? []).map((s: any) => s.name_jp).filter(Boolean)));
                return (
                  <Link key={w.id} href={`/workout/${w.id}`} className="block py-3">
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{w.date}</div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {exercises.slice(0, 3).join(' / ') || '種目未記録'}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xs text-slate-400">{(w.sets ?? []).length}セット</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
