import { NextResponse } from 'next/server';
import { db, workouts, workout_sets, exercises } from '@/lib/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET() {
  const { error, userId } = await requireUser();
  if (error) return error;

  const list = await db.select().from(workouts)
    .where(eq(workouts.user_id, userId))
    .orderBy(desc(workouts.date))
    .limit(30);

  if (list.length === 0) return NextResponse.json([]);

  const ids = list.map(w => w.id);
  const sets = await db.select({
    workout_id: workout_sets.workout_id,
    name_jp: exercises.name_jp,
    weight_kg: workout_sets.weight_kg,
    reps: workout_sets.reps,
  })
    .from(workout_sets)
    .leftJoin(exercises, eq(workout_sets.exercise_id, exercises.id))
    .where(sql`${workout_sets.workout_id} = ANY(${ids})`);

  const byWorkout = new Map<string, any[]>();
  for (const s of sets) {
    if (!byWorkout.has(s.workout_id)) byWorkout.set(s.workout_id, []);
    byWorkout.get(s.workout_id)!.push(s);
  }
  return NextResponse.json(list.map(w => ({ ...w, sets: byWorkout.get(w.id) ?? [] })));
}

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();
  const [row] = await db.insert(workouts).values({
    user_id: userId,
    date: body.date,
    name: body.name ?? 'ワークアウト',
    started_at: new Date(),
  }).returning();
  return NextResponse.json(row);
}
