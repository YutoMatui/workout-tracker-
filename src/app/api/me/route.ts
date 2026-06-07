import { NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET() {
  const { error, userId } = await requireUser();
  if (error) return error;
  const row = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return NextResponse.json(row[0] ?? null);
}

export async function PATCH(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();
  const allowed = [
    'display_name', 'height_cm', 'birthdate', 'sex', 'activity_level',
    'goal_weight_kg', 'goal_date', 'current_tdee', 'daily_calorie_target',
    'protein_target_g', 'fat_target_g', 'carb_target_g',
    'notify_weight_at', 'notify_meal_at', 'notify_enabled', 'onboarded',
  ];
  const patch: any = { updated_at: new Date() };
  for (const k of allowed) if (k in body) patch[k] = body[k];
  await db.update(users).set(patch).where(eq(users.id, userId));
  return NextResponse.json({ ok: true });
}
