'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-2">Workout Tracker</h1>
      <p className="text-slate-400 text-sm mb-8">
        体重・食事・トレーニングを1つで管理
      </p>

      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="w-full h-12 rounded-xl bg-white text-slate-900 font-semibold flex items-center justify-center gap-2"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Googleでログイン
      </button>
    </main>
  );
}
