import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireUser() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }), userId: null as never };
  return { error: null, userId };
}
