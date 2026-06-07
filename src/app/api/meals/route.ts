import { NextResponse } from 'next/server';
import { db, meal_logs, foods } from '@/lib/db';
import { and, eq, desc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const limit = Number(url.searchParams.get('limit') ?? 200);

  const conditions = [eq(meal_logs.user_id, userId)];
  if (date) conditions.push(eq(meal_logs.date, date));

  const rows = await db.select({
    log: meal_logs,
    food: foods,
  })
    .from(meal_logs)
    .leftJoin(foods, eq(meal_logs.food_id, foods.id))
    .where(and(...conditions))
    .orderBy(desc(meal_logs.logged_at))
    .limit(limit);

  return NextResponse.json(rows.map(r => ({ ...r.log, food: r.food })));
}

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();
  const food = (await db.select().from(foods).where(eq(foods.id, body.food_id)).limit(1))[0];
  if (!food) return NextResponse.json({ error: 'food not found' }, { status: 404 });

  const factor = Number(body.quantity_g) / 100;
  await db.insert(meal_logs).values({
    user_id: userId,
    date: body.date,
    meal_type: body.meal_type,
    food_id: body.food_id,
    quantity_g: String(body.quantity_g),
    kcal: String(Math.round(Number(food.kcal_per_100g) * factor)),
    protein_g: String(Math.round(Number(food.protein_g_per_100g) * factor * 10) / 10),
    fat_g: String(Math.round(Number(food.fat_g_per_100g) * factor * 10) / 10),
    carb_g: String(Math.round(Number(food.carb_g_per_100g) * factor * 10) / 10),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.delete(meal_logs).where(and(eq(meal_logs.id, id), eq(meal_logs.user_id, userId)));
  return NextResponse.json({ ok: true });
}
