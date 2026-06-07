'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { ChevronLeft, ChevronRight, Dumbbell, Scale, Utensils } from 'lucide-react';
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { api } from '@/lib/fetcher';

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

  const { data } = useQuery({
    queryKey: ['calendar', format(monthStart, 'yyyy-MM')],
    queryFn: () => api<any>(`/api/calendar?start=${format(rangeStart, 'yyyy-MM-dd')}&end=${format(rangeEnd, 'yyyy-MM-dd')}`),
  });

  const MUSCLE_ICONS: Record<string, string> = {
    chest: '胸', back: '背', legs: '脚', shoulders: '肩', arms: '腕', core: '腹', full: '全', cardio: '有',
  };

  return (
    <>
      <Header title="カレンダー" showBack />
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">{format(cursor, 'yyyy年M月')}</h2>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map(d => {
            const ds = format(d, 'yyyy-MM-dd');
            const info = data?.byDate?.[ds];
            const inMonth = isSameMonth(d, cursor);
            const isToday = isSameDay(d, new Date());
            const kcal = info?.kcal ?? 0;
            const target = data?.target ?? 2800;
            const kcalRatio = target > 0 ? kcal / target : 0;
            const kcalColor = kcal === 0 ? 'text-slate-700' :
              kcalRatio >= 0.9 && kcalRatio <= 1.1 ? 'text-emerald-400' :
              kcalRatio >= 0.7 && kcalRatio <= 1.2 ? 'text-amber-400' : 'text-red-400';

            return (
              <button
                key={ds}
                onClick={() => setSelected(d)}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-between text-[10px]
                  ${inMonth ? 'bg-slate-900' : 'bg-slate-950 opacity-40'}
                  ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
              >
                <div className="text-slate-300 font-semibold text-xs">{format(d, 'd')}</div>
                <div className="text-emerald-300 leading-none">{info?.muscle ? MUSCLE_ICONS[info.muscle] : ''}</div>
                <div className={`tabular-nums ${kcalColor}`}>
                  {kcal > 0 ? Math.round(kcal / 100) / 10 + 'k' : ''}
                </div>
                <div className="text-slate-400 tabular-nums">{info?.weight ? info.weight.toFixed(1) : ''}</div>
              </button>
            );
          })}
        </div>

        <Card className="mt-4">
          <div className="text-xs text-slate-400 mb-2">凡例</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">胸</span>
              <span className="text-slate-400">トレ部位</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 tabular-nums">2.8k</span>
              <span className="text-slate-400">摂取kcal (緑=±10%)</span>
            </div>
          </div>
        </Card>

        {selected && data && (
          <DayDetailSheet date={selected} info={data.byDate?.[format(selected, 'yyyy-MM-dd')]} onClose={() => setSelected(null)} />
        )}
      </div>
    </>
  );
}

function DayDetailSheet({ date, info, onClose }: { date: Date; info: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md mx-auto bg-slate-900 rounded-t-3xl p-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
        onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{format(date, 'M月d日 (E)', { locale: ja })}</h2>
        <div className="space-y-3">
          <Row icon={<Scale className="w-4 h-4" />} label="体重" value={info?.weight ? `${info.weight} kg` : '記録なし'} />
          <Row icon={<Utensils className="w-4 h-4" />} label="摂取kcal" value={info?.kcal ? `${Math.round(info.kcal)} kcal` : '記録なし'} />
          <Row icon={<Dumbbell className="w-4 h-4" />} label="トレ部位" value={info?.muscle ?? '休養日'} />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
      <div className="text-slate-400">{icon}</div>
      <div className="flex-1 text-sm text-slate-400">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
