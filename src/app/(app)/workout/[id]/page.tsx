'use client';
import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Plus, Trash2, Check, Timer } from 'lucide-react';
import { epley1RM } from '@/lib/tdee';
import { api } from '@/lib/fetcher';

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [picking, setPicking] = useState(false);
  const [restSec, setRestSec] = useState<number | null>(null);
  const [extraExercises, setExtraExercises] = useState<any[]>([]);

  const { data } = useQuery({
    queryKey: ['workout', id],
    queryFn: () => api<any>(`/api/workouts/${id}`),
  });
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => api<any[]>('/api/exercises'),
  });

  const addSet = useMutation({
    mutationFn: (input: { exercise_id: string; reps: number; weight_kg: number; rpe: number | null }) => {
      const ex = exercises.find((e: any) => e.id === input.exercise_id);
      if (ex) setRestSec(ex.default_rest_sec ?? 90);
      return api(`/api/workouts/${id}/sets`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout', id] }),
  });

  const remove = useMutation({
    mutationFn: (sid: string) => api(`/api/workout-sets/${sid}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workout', id] }),
  });

  const finish = useMutation({
    mutationFn: () => api(`/api/workouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ended_at: new Date().toISOString() }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });

  const groups = new Map<string, { exercise: any; sets: any[] }>();
  for (const ex of extraExercises) {
    groups.set(ex.id, { exercise: ex, sets: [] });
  }
  for (const s of (data?.sets ?? [])) {
    if (!groups.has(s.exercise_id)) groups.set(s.exercise_id, { exercise: s.exercise, sets: [] });
    groups.get(s.exercise_id)!.sets.push(s);
  }

  return (
    <>
      <Header
        title={data?.workout?.date ?? 'ワークアウト'}
        showBack
        rightSlot={
          data && !data.workout?.ended_at && (
            <button onClick={() => finish.mutate()} className="text-emerald-400 text-sm font-semibold">完了</button>
          )
        }
      />

      <div className="p-4 space-y-4 pb-32">
        {Array.from(groups.entries()).map(([exId, group]) => (
          <ExerciseGroup
            key={exId}
            exercise={group.exercise}
            sets={group.sets}
            workoutId={id}
            onAddSet={(reps: number, weight: number, rpe: number | null) => addSet.mutate({ exercise_id: exId, reps, weight_kg: weight, rpe })}
            onRemove={(sid: string) => remove.mutate(sid)}
          />
        ))}

        <button onClick={() => setPicking(true)}
          className="w-full h-14 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> 種目を追加
        </button>
      </div>

      {restSec !== null && <RestTimer seconds={restSec} onDone={() => setRestSec(null)} />}

      {picking && (
        <ExercisePickerSheet
          exercises={exercises}
          onPick={(ex: any) => {
            if (!extraExercises.find(e => e.id === ex.id) && !groups.has(ex.id)) {
              setExtraExercises(prev => [...prev, ex]);
            }
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}

function ExerciseGroup({ exercise, sets, workoutId, onAddSet, onRemove }: any) {
  const [weight, setWeight] = useState(sets.at(-1)?.weight_kg?.toString() ?? '');
  const [reps, setReps] = useState(sets.at(-1)?.reps?.toString() ?? '');
  const [rpe, setRpe] = useState('');

  const { data: lastSet } = useQuery({
    queryKey: ['last-set', exercise.id],
    queryFn: async () => {
      // workouts一覧から前回値推定 (簡易)
      const wks = await api<any[]>('/api/workouts');
      for (const w of wks) {
        if (w.id === workoutId) continue;
        const detail = await api<any>(`/api/workouts/${w.id}`);
        const match = detail.sets.find((s: any) => s.exercise_id === exercise.id);
        if (match) return { weight_kg: Number(match.weight_kg), reps: match.reps };
      }
      return null;
    },
    enabled: sets.length === 0,
  });

  const best1RM = sets.length > 0
    ? Math.max(...sets.map((s: any) => epley1RM(Number(s.weight_kg), s.reps)))
    : 0;

  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold">{exercise.name_jp}</div>
          <div className="text-xs text-slate-400">{exercise.muscle_group}</div>
        </div>
        {best1RM > 0 && (
          <div className="text-xs text-slate-400">e1RM <span className="text-emerald-400 font-bold tabular-nums">{best1RM}</span>kg</div>
        )}
      </div>

      <div className="space-y-1.5 mb-3">
        {sets.map((s: any, i: number) => (
          <div key={s.id} className="flex items-center gap-2 text-sm bg-slate-950 rounded-lg px-3 py-2">
            <span className="w-5 text-slate-500 text-xs">{i + 1}</span>
            <span className="tabular-nums font-semibold flex-1">{s.weight_kg}kg × {s.reps}</span>
            {s.rpe && <span className="text-xs text-slate-400">RPE {s.rpe}</span>}
            <button onClick={() => onRemove(s.id)} className="text-slate-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr_70px_auto] gap-2">
        <input type="number" inputMode="decimal" step="0.5" placeholder="kg" value={weight}
          onChange={e => setWeight(e.target.value)}
          className="h-12 rounded-xl bg-slate-950 border border-slate-800 px-3 text-center tabular-nums" />
        <input type="number" inputMode="numeric" placeholder="reps" value={reps}
          onChange={e => setReps(e.target.value)}
          className="h-12 rounded-xl bg-slate-950 border border-slate-800 px-3 text-center tabular-nums" />
        <input type="number" inputMode="decimal" step="0.5" placeholder="RPE" value={rpe}
          onChange={e => setRpe(e.target.value)}
          className="h-12 rounded-xl bg-slate-950 border border-slate-800 px-2 text-center" />
        <button
          onClick={() => {
            if (!weight || !reps) return;
            onAddSet(parseInt(reps), parseFloat(weight), rpe ? parseFloat(rpe) : null);
            setRpe('');
          }}
          className="h-12 w-12 rounded-xl bg-emerald-500">
          <Check className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {lastSet && (
        <button
          onClick={() => { setWeight(lastSet.weight_kg.toString()); setReps(lastSet.reps.toString()); }}
          className="mt-2 text-xs text-emerald-400">
          ↻ 前回値: {lastSet.weight_kg}kg × {lastSet.reps}
        </button>
      )}
    </Card>
  );
}

function ExercisePickerSheet({ exercises, onPick, onClose }: any) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const groups = [
    { id: 'all', label: '全て' }, { id: 'chest', label: '胸' }, { id: 'back', label: '背' },
    { id: 'legs', label: '脚' }, { id: 'shoulders', label: '肩' }, { id: 'arms', label: '腕' },
    { id: 'core', label: '腹' },
  ];
  const filtered = exercises.filter((e: any) =>
    (filter === 'all' || e.muscle_group === filter) &&
    (search === '' || e.name_jp.includes(search) || (e.name_en?.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md mx-auto bg-slate-900 rounded-t-3xl p-4 h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-3">種目を選択</h2>
        <input type="search" placeholder="検索" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 px-4 mb-3" />
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {groups.map(g => (
            <button key={g.id} onClick={() => setFilter(g.id)}
              className={`px-3 h-8 rounded-full text-xs flex-none ${filter === g.id ? 'bg-emerald-500' : 'bg-slate-800 text-slate-300'}`}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-slate-800">
          {filtered.map((ex: any) => (
            <button key={ex.id} onClick={() => onPick(ex)} className="w-full text-left py-3 flex justify-between items-center">
              <span className="text-sm">{ex.name_jp}</span>
              <span className="text-xs text-slate-400">{ex.equipment}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  return (
    <div className="fixed bottom-24 inset-x-0 z-30 px-4">
      <div className="max-w-md mx-auto bg-emerald-500 text-white rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        <Timer className="w-5 h-5" />
        <span className="font-bold text-lg tabular-nums flex-1">休憩 {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</span>
        <button onClick={onDone} className="text-sm font-semibold">スキップ</button>
      </div>
    </div>
  );
}
