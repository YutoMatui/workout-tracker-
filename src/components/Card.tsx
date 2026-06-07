import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn('rounded-2xl bg-slate-900 border border-slate-800 p-4', className)}
    />
  );
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn('text-xs text-slate-400 mb-1.5', className)} />;
}

export function CardBig({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn('text-3xl font-bold tabular-nums', className)} />;
}
