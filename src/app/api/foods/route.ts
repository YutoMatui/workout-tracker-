import { NextResponse } from 'next/server';
import { db, foods } from '@/lib/db';
import { or, ilike, eq, sql } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(req: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const limit = Number(url.searchParams.get('limit') ?? 30);

  let query = db.select().from(foods).limit(limit);
  if (q) {
    const term = `%${q}%`;
    query = query.where(or(ilike(foods.name, term), ilike(foods.name_kana, term))) as any;
  }
  const rows = await query;
  return NextResponse.json(rows);
}
