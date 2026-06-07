import { NextResponse } from 'next/server';
import { db, food_favorites, foods } from '@/lib/db';
import { and, eq, asc } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET() {
  const { error, userId } = await requireUser();
  if (error) return error;
  const rows = await db.select({ fav: food_favorites, food: foods })
    .from(food_favorites)
    .leftJoin(foods, eq(food_favorites.food_id, foods.id))
    .where(eq(food_favorites.user_id, userId))
    .orderBy(asc(food_favorites.sort_order));
  return NextResponse.json(rows.map(r => r.food));
}

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();
  const food_id = body.food_id as string;

  const existing = await db.select().from(food_favorites)
    .where(and(eq(food_favorites.user_id, userId), eq(food_favorites.food_id, food_id)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(food_favorites)
      .where(and(eq(food_favorites.user_id, userId), eq(food_favorites.food_id, food_id)));
    return NextResponse.json({ favorited: false });
  }
  await db.insert(food_favorites).values({ user_id: userId, food_id });
  return NextResponse.json({ favorited: true });
}
