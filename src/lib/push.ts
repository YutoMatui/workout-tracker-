import webpush from 'web-push';
import type { NotificationSubscription } from './types';

let initialized = false;
function init() {
  if (initialized) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:noreply@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  initialized = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export async function sendPush(sub: NotificationSubscription, payload: PushPayload): Promise<{ ok: boolean; expired?: boolean }> {
  init();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (e: any) {
    const expired = e?.statusCode === 404 || e?.statusCode === 410;
    return { ok: false, expired };
  }
}
