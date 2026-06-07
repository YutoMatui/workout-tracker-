'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scale, Utensils, Dumbbell, Plus } from 'lucide-react';
import { useState } from 'react';
import { QuickAddSheet } from './QuickAddSheet';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/weight', label: '体重', icon: Scale },
  { href: '__add__', label: '', icon: Plus },
  { href: '/food', label: '食事', icon: Utensils },
  { href: '/workout', label: 'トレ', icon: Dumbbell },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-5 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isAdd = item.href === '__add__';
            const active = !isAdd && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

            if (isAdd) {
              return (
                <li key="add" className="flex justify-center items-center">
                  <button
                    onClick={() => setOpen(true)}
                    aria-label="クイック追加"
                    className="-mt-6 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center active:scale-95 transition"
                  >
                    <Plus className="w-7 h-7" />
                  </button>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[10px]',
                    active ? 'text-emerald-400' : 'text-slate-400',
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
