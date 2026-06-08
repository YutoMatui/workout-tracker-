'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/fetcher';
import { calcCalorieTargets } from '@/lib/tdee';
import { todayISO } from '@/lib/utils';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    display_name: 'Yuto',
    height_cm: 170,
    birthdate: '1998-01-01',
    sex: 'male' as 'male' | 'female',
    activity_level: 1.55,
    current_weight: 62.5,
    goal_weight_kg: 70,
    goal_date: new Date(Date.now() + 120 * 86400 * 1000).toISOString().slice(0, 10),
  });

  const targets = calcCalorieTargets({
    sex: data.sex,
    height_cm: data.height_cm,
    birthdate: data.birthdate,
    activity_level: data.activity_level,
    weight_kg: data.current_weight,
  });

  async function save() {
    await api('/api/me', {
      method: 'PATCH',
      body: JSON.stringify({
        display_name: data.display_name,
        height_cm: data.height_cm,
        birthdate: data.birthdate,
        sex: data.sex,
        activity_level: data.activity_level,
        goal_weight_kg: data.goal_weight_kg,
        goal_date: data.goal_date,
        current_tdee: targets.tdee,
        daily_calorie_target: targets.daily_calorie_target,
        protein_target_g: targets.protein_target_g,
        fat_target_g: targets.fat_target_g,
        carb_target_g: targets.carb_target_g,
        onboarded: true,
      }),
    });
    await api('/api/weight', {
      method: 'POST',
      body: JSON.stringify({ date: todayISO(), weight_kg: data.current_weight }),
    });
    router.push('/');
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-12">
      <div className="flex gap-1 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className={`flex-1 h-1 rounded ${i <= step ? 'bg-emerald-500' : 'bg-slate-800'}`} />
        ))}
      </div>

      {step === 0 && (
        <Section title="あなたについて" desc="計算に使います">
          <Field label="身長 (cm)">
            <input type="number" value={data.height_cm}
              onChange={e => setData({ ...data, height_cm: +e.target.value })}
              className="input" />
          </Field>
          <Field label="生年月日">
            <input type="date" value={data.birthdate}
              onChange={e => setData({ ...data, birthdate: e.target.value })}
              className="input" />
          </Field>
          <Field label="性別">
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map(s => (
                <button key={s} onClick={() => setData({ ...data, sex: s })}
                  className={`h-12 rounded-xl border ${data.sex === s ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800'}`}>
                  {s === 'male' ? '男性' : '女性'}
                </button>
              ))}
            </div>
          </Field>
          <Field label="活動レベル">
            <select value={data.activity_level} onChange={e => setData({ ...data, activity_level: +e.target.value })} className="input">
              <option value={1.2}>運動なし (1.2)</option>
              <option value={1.375}>軽い運動 週1-3 (1.375)</option>
              <option value={1.55}>中程度 週3-5 (1.55)</option>
              <option value={1.725}>激しい 週6-7 (1.725)</option>
              <option value={1.9}>非常に激しい (1.9)</option>
            </select>
          </Field>
        </Section>
      )}

      {step === 1 && (
        <Section title="目標を設定" desc="現在地と4ヶ月後">
          <Field label="現在の体重 (kg)">
            <input type="number" step="0.1" value={data.current_weight}
              onChange={e => setData({ ...data, current_weight: +e.target.value })}
              className="input" />
          </Field>
          <Field label="目標体重 (kg)">
            <input type="number" step="0.1" value={data.goal_weight_kg}
              onChange={e => setData({ ...data, goal_weight_kg: +e.target.value })}
              className="input" />
          </Field>
          <Field label="目標達成日">
            <input type="date" value={data.goal_date}
              onChange={e => setData({ ...data, goal_date: e.target.value })}
              className="input" />
          </Field>
        </Section>
      )}

      {step === 2 && (
        <Section title="計算結果" desc="毎日この数値を目指します">
          <Row label="維持カロリー (TDEE)" value={`${targets.tdee} kcal`} />
          <Row label="目標摂取カロリー" value={`${targets.daily_calorie_target} kcal`} highlight />
          <hr className="border-slate-800 my-3" />
          <Row label="タンパク質" value={`${targets.protein_target_g} g`} />
          <Row label="脂質" value={`${targets.fat_target_g} g`} />
          <Row label="炭水化物" value={`${targets.carb_target_g} g`} />
          <p className="text-xs text-slate-500 mt-4">
            2週間ごとに実測値から自動で再計算されます
          </p>
        </Section>
      )}

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 h-12 rounded-xl bg-slate-800">
            戻る
          </button>
        )}
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 h-12 rounded-xl bg-emerald-500 font-semibold">
            次へ
          </button>
        ) : (
          <button onClick={save} className="flex-1 h-12 rounded-xl bg-emerald-500 font-semibold">
            開始する
          </button>
        )}
      </div>

      <style jsx>{`
        :global(.input) {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          height: 48px;
          border-radius: 12px;
          background: #0f172a;
          border: 1px solid #1e293b;
          padding: 0 16px;
          color: white;
          display: block;
        }
      `}</style>
    </main>
  );
}

function Section({ title, desc, children }: any) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-slate-400 text-sm mb-6">{desc}</p>
      <div className="space-y-4">{children}</div>
    </>
  );
}
function Field({ label, children }: any) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value, highlight }: any) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`tabular-nums font-bold ${highlight ? 'text-emerald-400 text-xl' : ''}`}>{value}</span>
    </div>
  );
}
