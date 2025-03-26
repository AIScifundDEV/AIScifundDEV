'use client';

import { SessionProvider } from 'next-auth/react';
import { Web3Provider } from '@/providers/Web3Provider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Web3Provider>{children}</Web3Provider>
    </SessionProvider>
  );
} 