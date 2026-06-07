import { NextResponse } from 'next/server';
import { db, weight_logs } from '@/lib/db';
import { and, eq, desc, gte } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function GET(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? 30);
  const since = url.searchParams.get('since');

  const conditions = [eq(weight_logs.user_id, userId)];
  if (since) conditions.push(gte(weight_logs.date, since));

  const rows = await db.select().from(weight_logs)
    .where(and(...conditions))
    .orderBy(desc(weight_logs.date))
    .limit(limit);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();
  await db.insert(weight_logs).values({
    user_id: userId,
    date: body.date,
    weight_kg: String(body.weight_kg),
    body_fat_pct: body.body_fat_pct != null ? String(body.body_fat_pct) : null,
    note: body.note ?? null,
  }).onConflictDoUpdate({
    target: [weight_logs.user_id, weight_logs.date],
    set: {
      weight_kg: String(body.weight_kg),
      body_fat_pct: body.body_fat_pct != null ? String(body.body_fat_pct) : null,
      note: body.note ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.delete(weight_logs).where(and(eq(weight_logs.id, id), eq(weight_logs.user_id, userId)));
  return NextResponse.json({ ok: true });
}
