import { NextResponse } from 'next/server';
import { db, workout_sets, workouts } from '@/lib/db';
import { and, eq, count } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const { id: workoutId } = await params;
  const body = await req.json();

  // workoutが本人のものか確認
  const [w] = await db.select().from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.user_id, userId)))
    .limit(1);
  if (!w) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // 同種目の次のセット番号を計算
  const [{ value }] = await db.select({ value: count() })
    .from(workout_sets)
    .where(and(eq(workout_sets.workout_id, workoutId), eq(workout_sets.exercise_id, body.exercise_id)));
  const setNo = (Number(value) ?? 0) + 1;

  const [row] = await db.insert(workout_sets).values({
    workout_id: workoutId,
    exercise_id: body.exercise_id,
    set_no: setNo,
    reps: body.reps,
    weight_kg: String(body.weight_kg),
    rpe: body.rpe != null ? String(body.rpe) : null,
    is_warmup: body.is_warmup ?? false,
  }).returning();

  return NextResponse.json(row);
}
