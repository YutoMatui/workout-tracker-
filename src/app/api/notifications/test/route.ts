import { NextResponse } from 'next/server';
import { db, notification_subscriptions } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helper';
import { sendPush } from '@/lib/push';

export async function POST() {
  const { error, userId } = await requireUser();
  if (error) return error;

  const subs = await db.select().from(notification_subscriptions)
    .where(eq(notification_subscriptions.user_id, userId));

  for (const s of subs) {
    await sendPush(s as any, {
      title: 'テスト通知',
      body: '通知が正常に届いています',
      url: '/',
    });
  }
  return NextResponse.json({ ok: true, sent: subs.length });
}
