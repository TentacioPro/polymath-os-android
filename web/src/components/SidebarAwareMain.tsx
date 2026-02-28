'use client';

import { useSidebar } from '@/hooks/useSidebar';
import type { ReactNode } from 'react';

export default function SidebarAwareMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`pt-[60px] pb-[100px] px-5 md:pt-6 md:pb-8 md:pr-6 lg:pr-10 transition-all duration-200 ${
        collapsed
          ? 'md:pl-[calc(4rem+1.5rem)] lg:pl-[calc(4rem+2.5rem)]'
          : 'md:pl-[calc(15rem+1.5rem)] lg:pl-[calc(15rem+2.5rem)]'
      }`}
    >
      {children}
    </main>
  );
}
