import { NextResponse } from 'next/server';
import { db, workout_sets, workouts } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const { id } = await params;

  // user_idチェック (join経由)
  const rows = await db.select({ id: workout_sets.id })
    .from(workout_sets)
    .innerJoin(workouts, eq(workout_sets.workout_id, workouts.id))
    .where(and(eq(workout_sets.id, id), eq(workouts.user_id, userId)));
  if (rows.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await db.delete(workout_sets).where(eq(workout_sets.id, id));
  return NextResponse.json({ ok: true });
}
