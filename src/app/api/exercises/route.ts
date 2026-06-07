import { NextResponse } from 'next/server';
import { db, exercises } from '@/lib/db';
import { eq, or, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET() {
  const { error, userId } = await requireUser();
  if (error) return error;
  const rows = await db.select().from(exercises)
    .where(or(eq(exercises.is_global, true), eq(exercises.user_id, userId)))
    .orderBy(asc(exercises.muscle_group), asc(exercises.name_jp));
  return NextResponse.json(rows);
}
