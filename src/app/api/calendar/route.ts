import { NextResponse } from 'next/server';
import { db, users, weight_logs, meal_logs, workouts, workout_sets, exercises } from '@/lib/db';
import { and, eq, gte, lte } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const start = url.searchParams.get('start')!;
  const end = url.searchParams.get('end')!;

  const [profile, weights, meals, woks] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(weight_logs).where(and(eq(weight_logs.user_id, userId), gte(weight_logs.date, start), lte(weight_logs.date, end))),
    db.select().from(meal_logs).where(and(eq(meal_logs.user_id, userId), gte(meal_logs.date, start), lte(meal_logs.date, end))),
    db.select({ workout: workouts, muscle: exercises.muscle_group })
      .from(workouts)
      .leftJoin(workout_sets, eq(workouts.id, workout_sets.workout_id))
      .leftJoin(exercises, eq(workout_sets.exercise_id, exercises.id))
      .where(and(eq(workouts.user_id, userId), gte(workouts.date, start), lte(workouts.date, end))),
  ]);

  const byDate: Record<string, { kcal: number; weight?: number; muscle?: string }> = {};
  for (const w of weights) {
    byDate[w.date] ??= { kcal: 0 };
    byDate[w.date].weight = Number(w.weight_kg);
  }
  for (const m of meals) {
    byDate[m.date] ??= { kcal: 0 };
    byDate[m.date].kcal += Number(m.kcal);
  }
  for (const r of woks) {
    if (!r.workout) continue;
    byDate[r.workout.date] ??= { kcal: 0 };
    byDate[r.workout.date].muscle ??= r.muscle ?? undefined;
  }

  return NextResponse.json({
    target: profile[0]?.daily_calorie_target ?? 2800,
    byDate,
  });
}
