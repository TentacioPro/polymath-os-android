'use client';

import { useSidebar } from '@/hooks/useSidebar';
import type { ReactNode } from 'react';

export default function SidebarAwareMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={`pt-15 pb-25 px-5 md:pt-6 md:pb-8 md:pr-6 lg:pr-10 transition-standard ${
        collapsed
          ? 'md:pl-[calc(72px+1.5rem)] lg:pl-[calc(72px+2.5rem)]'
          : 'md:pl-[calc(260px+1.5rem)] lg:pl-[calc(260px+2.5rem)]'
      }`}
    >
      <div className="max-w-[1600px] mx-auto w-full">
        {children}
      </div>
    </main>
  );
}
