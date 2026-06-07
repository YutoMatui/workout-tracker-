import { NextResponse } from 'next/server';
import { db, users, weight_logs, workout_sets, workouts, exercises } from '@/lib/db';
import { and, eq, gte, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';
import { subDays, format } from 'date-fns';

export async function GET() {
  const { error, userId } = await requireUser();
  if (error) return error;
  const since = format(subDays(new Date(), 90), 'yyyy-MM-dd');

  const [profile, weights, sets] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(weight_logs)
      .where(and(eq(weight_logs.user_id, userId), gte(weight_logs.date, since)))
      .orderBy(asc(weight_logs.date)),
    db.select({
      set: workout_sets,
      exercise: exercises,
      workout: workouts,
    })
      .from(workout_sets)
      .innerJoin(workouts, eq(workout_sets.workout_id, workouts.id))
      .leftJoin(exercises, eq(workout_sets.exercise_id, exercises.id))
      .where(and(eq(workouts.user_id, userId), gte(workouts.date, since))),
  ]);

  return NextResponse.json({
    profile: profile[0] ?? null,
    weights,
    sets: sets.map(s => ({ ...s.set, exercises: s.exercise, workouts: s.workout })),
  });
}
