'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings } from 'lucide-react';

export function Header({
  title,
  showBack = false,
  showSettings = false,
  rightSlot,
}: {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header
      className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button onClick={() => router.back()} aria-label="戻る" className="-ml-2 p-2 text-slate-300">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-base font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {rightSlot}
          {showSettings && (
            <Link href="/settings" aria-label="設定" className="p-2 text-slate-300">
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
