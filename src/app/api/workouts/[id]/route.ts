import { NextResponse } from 'next/server';
import { db, workouts, workout_sets, exercises } from '@/lib/db';
import { and, eq, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const { id } = await params;

  const [workout] = await db.select().from(workouts)
    .where(and(eq(workouts.id, id), eq(workouts.user_id, userId)))
    .limit(1);
  if (!workout) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const sets = await db.select({
    set: workout_sets,
    exercise: exercises,
  })
    .from(workout_sets)
    .leftJoin(exercises, eq(workout_sets.exercise_id, exercises.id))
    .where(eq(workout_sets.workout_id, id))
    .orderBy(asc(workout_sets.set_no));

  return NextResponse.json({
    workout,
    sets: sets.map(s => ({ ...s.set, exercise: s.exercise })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const patch: any = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.note !== undefined) patch.note = body.note;
  if (body.ended_at !== undefined) patch.ended_at = body.ended_at ? new Date(body.ended_at) : new Date();

  await db.update(workouts).set(patch)
    .where(and(eq(workouts.id, id), eq(workouts.user_id, userId)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const { id } = await params;
  await db.delete(workouts).where(and(eq(workouts.id, id), eq(workouts.user_id, userId)));
  return NextResponse.json({ ok: true });
}
