'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth/client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const bypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === '1';

  useEffect(() => {
    if (bypass) return;
    if (!getToken()) {
      router.replace('/login');
    }
  }, [router, bypass]);

  return <>{children}</>;
}
