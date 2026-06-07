import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayISO(tz = 'Asia/Tokyo'): string {
  const now = new Date();
  const offset = -now.getTimezoneOffset() / 60;
  const tzOffset = 9;
  const adjusted = new Date(now.getTime() + (tzOffset - offset) * 3600 * 1000);
  return adjusted.toISOString().slice(0, 10);
}

export function formatKcal(n: number | null | undefined): string {
  if (n == null) return '—';
  return Math.round(n).toLocaleString() + ' kcal';
}

export function formatWeight(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toFixed(1) + ' kg';
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
