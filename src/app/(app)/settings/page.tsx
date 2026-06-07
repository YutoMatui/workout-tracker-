'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Card, CardTitle } from '@/components/Card';
import { Bell, LogOut, RefreshCw } from 'lucide-react';
import { urlBase64ToUint8Array } from '@/lib/utils';
import { api } from '@/lib/fetcher';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [pushStatus, setPushStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt' | 'default'>('unknown');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api<any>('/api/me'),
  });

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPushStatus(Notification.permission as any);
    }
  }, []);

  const update = useMutation({
    mutationFn: (patch: any) => api('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  async function enablePush() {
    const perm = await Notification.requestPermission();
    setPushStatus(perm as any);
    if (perm !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as BufferSource,
    });
    const json = sub.toJSON();
    await api('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        user_agent: navigator.userAgent,
      }),
    });
    alert('通知を有効にしました');
  }

  async function recalcTdee() {
    try {
      const r = await api<any>('/api/tdee/recalc', { method: 'POST' });
      alert(`TDEEを更新しました\n新目標: ${r.new_target_kcal} kcal`);
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (e: any) {
      alert(e.message ?? '更新できませんでした');
    }
  }

  if (!profile) return <Header title="設定" showBack />;

  return (
    <>
      <Header title="設定" showBack />
      <div className="p-4 space-y-4">

        <Card>
          <CardTitle>プロフィール</CardTitle>
          <Field label="表示名">
            <input type="text" defaultValue={profile.display_name}
              onBlur={(e) => update.mutate({ display_name: e.target.value })}
              className="input" />
          </Field>
          <Field label="身長 (cm)">
            <input type="number" defaultValue={profile.height_cm}
              onBlur={(e) => update.mutate({ height_cm: +e.target.value })}
              className="input" />
          </Field>
          <Field label="活動レベル">
            <select defaultValue={profile.activity_level}
              onChange={(e) => update.mutate({ activity_level: +e.target.value })}
              className="input">
              <option value={1.2}>運動なし (1.2)</option>
              <option value={1.375}>軽い運動 (1.375)</option>
              <option value={1.55}>中程度 (1.55)</option>
              <option value={1.725}>激しい (1.725)</option>
              <option value={1.9}>非常に激しい (1.9)</option>
            </select>
          </Field>
        </Card>

        <Card>
          <CardTitle>目標</CardTitle>
          <Field label="目標体重 (kg)">
            <input type="number" step="0.1" defaultValue={profile.goal_weight_kg}
              onBlur={(e) => update.mutate({ goal_weight_kg: +e.target.value })}
              className="input" />
          </Field>
          <Field label="目標日">
            <input type="date" defaultValue={profile.goal_date}
              onBlur={(e) => update.mutate({ goal_date: e.target.value })}
              className="input" />
          </Field>
          <div className="mt-3 p-3 bg-slate-950 rounded-xl text-sm">
            <div className="flex justify-between"><span className="text-slate-400">維持kcal</span><span className="tabular-nums">{profile.current_tdee}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">目標摂取</span><span className="tabular-nums font-bold text-emerald-400">{profile.daily_calorie_target}</span></div>
            <div className="flex justify-between mt-1"><span className="text-slate-400">P / F / C</span><span className="tabular-nums">{profile.protein_target_g} / {profile.fat_target_g} / {profile.carb_target_g} g</span></div>
          </div>
          <button onClick={recalcTdee} className="mt-3 w-full h-11 rounded-xl bg-slate-800 flex items-center justify-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> TDEEを再計算
          </button>
        </Card>

        <Card>
          <CardTitle>通知</CardTitle>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">プッシュ通知</span>
            {pushStatus === 'granted' ? (
              <span className="text-emerald-400 text-sm flex items-center gap-1"><Bell className="w-4 h-4" /> 有効</span>
            ) : (
              <button onClick={enablePush} className="text-emerald-400 text-sm">有効にする</button>
            )}
          </div>
          <Field label="体重リマインド時刻">
            <input type="time" defaultValue={profile.notify_weight_at?.slice(0, 5)}
              onBlur={(e) => update.mutate({ notify_weight_at: e.target.value + ':00' })}
              className="input" />
          </Field>
          <Field label="通知ON/OFF">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked={profile.notify_enabled}
                onChange={(e) => update.mutate({ notify_enabled: e.target.checked })}
                className="w-5 h-5" />
              <span className="text-sm text-slate-400">体重・食事リマインドを受け取る</span>
            </label>
          </Field>
        </Card>

        <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full h-12 rounded-xl bg-slate-900 border border-slate-800 text-red-400 flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> ログアウト
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          background: #020617;
          border: 1px solid #1e293b;
          padding: 0 12px;
          color: white;
          margin-top: 4px;
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block py-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}
