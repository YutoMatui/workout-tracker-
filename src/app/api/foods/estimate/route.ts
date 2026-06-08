import { NextResponse } from 'next/server';
import { db, foods } from '@/lib/db';
import { requireUser } from '@/lib/auth-helper';
import { estimateFoodNutrition } from '@/lib/gemini';
import { ilike, eq, or } from 'drizzle-orm';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;

  const { name } = await req.json();
  if (!name || typeof name !== 'string' || name.length > 100) {
    return NextResponse.json({ error: 'name required (max 100 chars)' }, { status: 400 });
  }

  // 既存と完全一致したら推論しない (冪等)
  const existing = await db.select().from(foods).where(eq(foods.name, name)).limit(1);
  if (existing.length > 0) return NextResponse.json(existing[0]);

  let est;
  try {
    est = await estimateFoodNutrition(name);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'AI estimation failed' }, { status: 502 });
  }

  // 似た名前で既に登録済みなら使い回し
  const similar = await db.select().from(foods)
    .where(or(eq(foods.name, est.name), ilike(foods.name, `%${est.name}%`)))
    .limit(1);
  if (similar.length > 0) return NextResponse.json(similar[0]);

  const [row] = await db.insert(foods).values({
    name: est.name,
    name_kana: est.name_kana,
    kcal_per_100g: String(est.kcal_per_100g),
    protein_g_per_100g: String(est.protein_g_per_100g),
    fat_g_per_100g: String(est.fat_g_per_100g),
    carb_g_per_100g: String(est.carb_g_per_100g),
    source: 'ai',
    user_id: userId,
  }).returning();

  return NextResponse.json(row);
}
