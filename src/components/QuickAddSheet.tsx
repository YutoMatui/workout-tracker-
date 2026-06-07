'use client';
import Link from 'next/link';
import { Scale, Utensils, Dumbbell, X } from 'lucide-react';

export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md mx-auto bg-slate-900 rounded-t-3xl p-6 pb-10"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">クイック追加</h2>
          <button onClick={onClose} aria-label="閉じる" className="text-slate-400 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <QuickItem href="/weight?new=1" icon={Scale} label="体重" color="bg-blue-500/20 text-blue-300" onClick={onClose} />
          <QuickItem href="/food?new=1" icon={Utensils} label="食事" color="bg-amber-500/20 text-amber-300" onClick={onClose} />
          <QuickItem href="/workout?new=1" icon={Dumbbell} label="トレ" color="bg-emerald-500/20 text-emerald-300" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function QuickItem({ href, icon: Icon, label, color, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl p-5 ${color} active:scale-95 transition`}
    >
      <Icon className="w-7 h-7" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
