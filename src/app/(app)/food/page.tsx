'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { todayISO } from '@/lib/utils';
import { Search, Star, Trash2 } from 'lucide-react';
import { api } from '@/lib/fetcher';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食',
};

export default function FoodPage() {
  const qc = useQueryClient();
  const today = todayISO();
  const [mealType, setMealType] = useState<keyof typeof MEAL_LABELS>('breakfast');
  const [search, setSearch] = useState('');
  const [picking, setPicking] = useState<any>(null);
  const [quantity, setQuantity] = useState('100');

  const { data: meals = [] } = useQuery({
    queryKey: ['meals', today],
    queryFn: () => api<any[]>(`/api/meals?date=${today}`),
  });
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api<any[]>('/api/favorites'),
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['food-search', search],
    enabled: search.length >= 1,
    queryFn: () => api<any[]>(`/api/foods?q=${encodeURIComponent(search)}`),
  });

  const addMeal = useMutation({
    mutationFn: () => api('/api/meals', {
      method: 'POST',
      body: JSON.stringify({
        date: today,
        meal_type: mealType,
        food_id: picking.id,
        quantity_g: parseFloat(quantity),
      }),
    }),
    onSuccess: () => {
      setPicking(null); setQuantity('100'); setSearch('');
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/api/meals?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: (food: any) => api('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ food_id: food.id }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const totalKcal = meals.reduce((s: number, m: any) => s + Number(m.kcal), 0);

  return (
    <>
      <Header title="食事" showBack
        rightSlot={<div className="text-sm font-semibold tabular-nums">{Math.round(totalKcal)} kcal</div>}
      />
      <div className="p-4 space-y-4">

        <div className="grid grid-cols-4 gap-1.5">
          {Object.keys(MEAL_LABELS).map(t => (
            <button key={t} onClick={() => setMealType(t as any)}
              className={`h-10 rounded-xl text-sm ${mealType === t ? 'bg-emerald-500 text-white font-semibold' : 'bg-slate-900 text-slate-400'}`}>
              {MEAL_LABELS[t]}
            </button>
          ))}
        </div>

        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="search" placeholder="食品を検索"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-12 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4"
            />
          </div>

          {search.length === 0 ? (
            favorites.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <Star className="w-3 h-3" /> よく食べる
                </div>
                <FoodList items={favorites} onPick={setPicking} favorites={favorites} onToggleFav={f => toggleFavorite.mutate(f)} />
              </div>
            )
          ) : (
            <div className="mt-3">
              <FoodList items={searchResults} onPick={setPicking} favorites={favorites} onToggleFav={f => toggleFavorite.mutate(f)} />
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>{MEAL_LABELS[mealType]}の記録</CardTitle>
          {meals.filter((m: any) => m.meal_type === mealType).length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-6">まだ記録なし</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {meals.filter((m: any) => m.meal_type === mealType).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{m.food?.name}</div>
                    <div className="text-xs text-slate-400">{m.quantity_g}g / {Math.round(m.kcal)}kcal</div>
                  </div>
                  <button onClick={() => remove.mutate(m.id)} className="p-2 text-slate-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {picking && (
        <div className="fixed inset-0 z-40 flex items-end" onClick={() => setPicking(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full max-w-md mx-auto bg-slate-900 rounded-t-3xl p-6"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">{picking.name}</h2>
            <p className="text-xs text-slate-400 mb-4">{picking.kcal_per_100g} kcal / 100g</p>
            <label className="text-xs text-slate-400">量 (g)</label>
            <input type="number" inputMode="numeric" value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full h-14 rounded-xl bg-slate-950 border border-slate-800 px-4 text-2xl tabular-nums text-center mt-1 mb-3" />
            <div className="text-sm text-slate-400 mb-4 tabular-nums text-center">
              {Math.round(Number(picking.kcal_per_100g) * (parseFloat(quantity) / 100) || 0)} kcal /
              P {((Number(picking.protein_g_per_100g) * parseFloat(quantity)) / 100 || 0).toFixed(1)}g /
              F {((Number(picking.fat_g_per_100g) * parseFloat(quantity)) / 100 || 0).toFixed(1)}g /
              C {((Number(picking.carb_g_per_100g) * parseFloat(quantity)) / 100 || 0).toFixed(1)}g
            </div>
            <button onClick={() => addMeal.mutate()} disabled={addMeal.isPending}
              className="w-full h-12 rounded-xl bg-emerald-500 font-semibold">追加する</button>
          </div>
        </div>
      )}
    </>
  );
}

function FoodList({ items, onPick, favorites, onToggleFav }: any) {
  if (items.length === 0) return <div className="text-slate-500 text-sm text-center py-4">候補なし</div>;
  return (
    <div className="divide-y divide-slate-800">
      {items.map((f: any) => (
        <div key={f.id} className="flex items-center gap-2 py-2">
          <button onClick={() => onPick(f)} className="flex-1 text-left">
            <div className="text-sm">{f.name}</div>
            <div className="text-xs text-slate-400">{Math.round(Number(f.kcal_per_100g))}kcal / 100g</div>
          </button>
          <button onClick={() => onToggleFav(f)} className="p-2">
            <Star className={`w-4 h-4 ${favorites.some((x: any) => x.id === f.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}
