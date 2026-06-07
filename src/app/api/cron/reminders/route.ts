import { NextResponse } from 'next/server';
import { db, users, weight_logs, meal_logs, notification_subscriptions, tdee_history } from '@/lib/db';
import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { sendPush } from '@/lib/push';
import { format, subDays } from 'date-fns';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const currentHHmm = format(now, 'HH:mm');
  const today = format(now, 'yyyy-MM-dd');

  const allUsers = await db.select().from(users).where(eq(users.notify_enabled, true));
  let sent = 0;

  for (const u of allUsers) {
    const subs = await db.select().from(notification_subscriptions)
      .where(eq(notification_subscriptions.user_id, u.id));
    if (subs.length === 0) continue;

    const notifications: { title: string; body: string; url: string; tag: string }[] = [];

    // 体重リマインド
    if (u.notify_weight_at?.slice(0, 5) === currentHHmm) {
      const todayWeight = await db.select().from(weight_logs)
        .where(and(eq(weight_logs.user_id, u.id), eq(weight_logs.date, today))).limit(1);
      if (todayWeight.length === 0) {
        notifications.push({ title: 'おはよう', body: '体重を記録しましょう', url: '/weight', tag: `weight-${today}` });
      }
    }

    // 食事リマインド
    if (u.notify_meal_at?.some((t: string) => t.slice(0, 5) === currentHHmm)) {
      notifications.push({ title: '食事の記録', body: '直近の食事を記録しましょう', url: '/food', tag: `meal-${today}-${currentHHmm}` });
    }

    // 22時時点でkcal達成率70%未満
    if (currentHHmm === '22:00' && u.daily_calorie_target) {
      const todayMeals = await db.select().from(meal_logs)
        .where(and(eq(meal_logs.user_id, u.id), eq(meal_logs.date, today)));
      const total = todayMeals.reduce((s, m) => s + Number(m.kcal), 0);
      if (total / u.daily_calorie_target < 0.7) {
        notifications.push({
          title: 'カロリー不足',
          body: `残り ${Math.round(u.daily_calorie_target - total)}kcal。間食でカバーしませんか?`,
          url: '/food',
          tag: `kcal-low-${today}`,
        });
      }
    }

    // 体重3日連続未記録
    if (currentHHmm === '20:00') {
      const since = format(subDays(now, 3), 'yyyy-MM-dd');
      const recent = await db.select({ c: sql<number>`count(*)` }).from(weight_logs)
        .where(and(eq(weight_logs.user_id, u.id), gte(weight_logs.date, since)));
      if (Number(recent[0]?.c ?? 0) === 0) {
        notifications.push({ title: '3日間記録がありません', body: '続けることが目標達成のカギです', url: '/weight', tag: `weight-streak-${today}` });
      }
    }

    // 2週間経過でTDEE再計算案内
    if (currentHHmm === '08:00') {
      const last = await db.select().from(tdee_history)
        .where(eq(tdee_history.user_id, u.id))
        .orderBy(desc(tdee_history.calculated_at)).limit(1);
      const daysSince = last[0] ? Math.floor((now.getTime() - new Date(last[0].calculated_at).getTime()) / 86400000) : 999;
      if (daysSince >= 14) {
        notifications.push({ title: 'TDEEを更新できます', body: '設定画面から再計算しましょう', url: '/settings', tag: `tdee-${today}` });
      }
    }

    for (const n of notifications) {
      for (const s of subs) {
        const r = await sendPush(s as any, n);
        if (r.expired) {
          await db.delete(notification_subscriptions).where(eq(notification_subscriptions.endpoint, s.endpoint));
        }
        sent++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
