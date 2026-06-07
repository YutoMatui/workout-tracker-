import { NextResponse } from 'next/server';
import { db, users, weight_logs, meal_logs, workouts, workout_sets } from '@/lib/db';
import { and, eq, desc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;

  const today = new URL(req.url).searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const [profile, todayMeals, todayWorkouts, weights] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(meal_logs).where(and(eq(meal_logs.user_id, userId), eq(meal_logs.date, today))),
    db.select().from(workouts).where(and(eq(workouts.user_id, userId), eq(workouts.date, today))),
    db.select().from(weight_logs).where(eq(weight_logs.user_id, userId)).orderBy(desc(weight_logs.date)).limit(30),
  ]);

  let workoutsWithSets: any[] = [];
  if (todayWorkouts.length > 0) {
    const ids = todayWorkouts.map(w => w.id);
    workoutsWithSets = await Promise.all(todayWorkouts.map(async w => {
      const sets = await db.select().from(workout_sets).where(eq(workout_sets.workout_id, w.id));
      return { ...w, sets };
    }));
  }

  return NextResponse.json({
    profile: profile[0] ?? null,
    meals: todayMeals,
    workouts: workoutsWithSets,
    weights,
  });
}
