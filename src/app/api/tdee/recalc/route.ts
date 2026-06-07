import { NextResponse } from 'next/server';
import { db, users, weight_logs, meal_logs, tdee_history } from '@/lib/db';
import { and, eq, gte, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';
import { adaptiveTdee } from '@/lib/tdee';
import { format, subDays } from 'date-fns';

export async function POST() {
  const { error, userId } = await requireUser();
  if (error) return error;
  const since = format(subDays(new Date(), 14), 'yyyy-MM-dd');

  const [profile, weights, meals] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(weight_logs)
      .where(and(eq(weight_logs.user_id, userId), gte(weight_logs.date, since)))
      .orderBy(asc(weight_logs.date)),
    db.select().from(meal_logs)
      .where(and(eq(meal_logs.user_id, userId), gte(meal_logs.date, since))),
  ]);

  if (!profile[0] || weights.length < 2) {
    return NextResponse.json({ error: '体重ログが2件以上必要です' }, { status: 400 });
  }

  const latestWeight = Number(weights[weights.length - 1].weight_kg);
  const weightsNorm = weights.map(w => ({ ...w, weight_kg: Number(w.weight_kg) } as any));
  const mealsNorm = meals.map(m => ({ ...m, kcal: Number(m.kcal) } as any));

  const result = adaptiveTdee(weightsNorm, mealsNorm, latestWeight);
  if (!result) return NextResponse.json({ error: '計算条件を満たしません' }, { status: 400 });

  const proteinTarget = Math.round(latestWeight * 2.0);
  const fatTarget = Math.round((result.new_target_kcal * 0.25) / 9);
  const carbTarget = Math.round((result.new_target_kcal - proteinTarget * 4 - fatTarget * 9) / 4);

  await db.update(users).set({
    current_tdee: result.estimated_tdee,
    daily_calorie_target: result.new_target_kcal,
    protein_target_g: proteinTarget,
    fat_target_g: fatTarget,
    carb_target_g: carbTarget,
    updated_at: new Date(),
  }).where(eq(users.id, userId));

  await db.insert(tdee_history).values({
    user_id: userId,
    period_days: result.period_days,
    avg_intake_kcal: String(result.avg_intake_kcal),
    weight_change_kg: String(result.weight_change_kg),
    estimated_tdee: result.estimated_tdee,
    new_target_kcal: result.new_target_kcal,
  });

  return NextResponse.json({ ok: true, ...result });
}
