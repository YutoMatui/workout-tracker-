'use client';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { CalorieRing } from '@/components/CalorieRing';
import { PfcBar } from '@/components/PfcBar';
import { WeightChart } from '@/components/WeightChart';
import { todayISO, formatWeight } from '@/lib/utils';
import { api } from '@/lib/fetcher';
import Link from 'next/link';
import { Dumbbell, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const today = todayISO();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', today],
    queryFn: () => api(`/api/dashboard?date=${today}`),
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (data && !data.profile?.onboarded) router.push('/onboarding');
  }, [data, router]);

  if (isLoading || !data) {
    return (
      <>
        <Header title="ホーム" showSettings />
        <div className="p-4 text-slate-400">読み込み中…</div>
      </>
    );
  }

  const { profile, meals, workouts, weights } = data as any;
  if (!profile) return null;

  const num = (v: any) => Number(v ?? 0);
  const totalKcal = meals.reduce((s: number, m: any) => s + num(m.kcal), 0);
  const totalP = meals.reduce((s: number, m: any) => s + num(m.protein_g), 0);
  const totalF = meals.reduce((s: number, m: any) => s + num(m.fat_g), 0);
  const totalC = meals.reduce((s: number, m: any) => s + num(m.carb_g), 0);
  const latestWeight = weights[0]?.weight_kg ? Number(weights[0].weight_kg) : null;
  const prevWeight = weights[1]?.weight_kg ? Number(weights[1].weight_kg) : null;
  const diff = latestWeight != null && prevWeight != null ? latestWeight - prevWeight : null;

  return (
    <>
      <Header title={`こんにちは、${profile.display_name}`} showSettings />
      <div className="p-4 space-y-4">

        <Card>
          <div className="flex items-end justify-between">
            <div>
              <CardTitle>今日の体重</CardTitle>
              <div className="text-4xl font-bold tabular-nums">{formatWeight(latestWeight)}</div>
              {diff != null && (
                <div className={`text-xs mt-1 ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  前回比 {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                </div>
              )}
            </div>
            <Link href="/weight" className="text-emerald-400 text-sm">記録 →</Link>
          </div>
          <div className="mt-3 -mx-2">
            <WeightChart logs={weights.map((w: any) => ({ ...w, weight_kg: Number(w.weight_kg) }))} goalWeight={Number(profile.goal_weight_kg)} height={140} />
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center">
            目標: {profile.goal_weight_kg}kg / {profile.goal_date}まで
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start mb-3">
            <CardTitle>今日のカロリー</CardTitle>
            <Link href="/food" className="text-emerald-400 text-xs">食事を追加</Link>
          </div>
          <div className="flex justify-center my-2">
            <CalorieRing consumed={totalKcal} target={profile.daily_calorie_target ?? 2800} />
          </div>
          <div className="mt-4">
            <PfcBar
              p={totalP} f={totalF} c={totalC}
              pT={profile.protein_target_g ?? 140}
              fT={profile.fat_target_g ?? 80}
              cT={profile.carb_target_g ?? 400}
            />
          </div>
        </Card>

        <Card>
          <CardTitle>今日のワークアウト</CardTitle>
          {workouts.length === 0 ? (
            <Link href="/workout?new=1" className="mt-2 flex items-center justify-center h-16 rounded-xl border border-dashed border-slate-700 text-slate-400">
              <Dumbbell className="w-5 h-5 mr-2" /> トレーニングを開始
            </Link>
          ) : (
            <div className="space-y-1.5 mt-2">
              {workouts.map((w: any) => (
                <Link key={w.id} href={`/workout/${w.id}`} className="block py-2 border-b border-slate-800 last:border-0">
                  <div className="flex justify-between text-sm">
                    <span>{w.name ?? 'ワークアウト'}</span>
                    <span className="text-slate-400">{w.sets.length} セット</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Link href="/stats" className="block">
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">統計を見る</span>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </Card>
        </Link>
      </div>
    </>
  );
}
