import { NextResponse } from 'next/server';
import { db, notification_subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';

export async function POST(req: Request) {
  const { error, userId } = await requireUser();
  if (error) return error;
  const body = await req.json();

  await db.insert(notification_subscriptions).values({
    user_id: userId,
    endpoint: body.endpoint,
    p256dh: body.p256dh,
    auth: body.auth,
    user_agent: body.user_agent ?? null,
  }).onConflictDoUpdate({
    target: notification_subscriptions.endpoint,
    set: {
      user_id: userId,
      p256dh: body.p256dh,
      auth: body.auth,
      user_agent: body.user_agent ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const { endpoint } = await req.json();
  await db.delete(notification_subscriptions).where(eq(notification_subscriptions.endpoint, endpoint));
  return NextResponse.json({ ok: true });
}
