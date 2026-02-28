'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/activities': 'Activities',
  '/journal': 'Journal',
  '/connections': 'Neural Mesh',
  '/export': 'Export',
  '/agent': 'Agent Memory',
};

export default function TopHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Polymath OS';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-poly-border bg-poly-bg/90 md:hidden">
      <div className="px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-8 h-8 border border-poly-border hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
            onClick={() => {
              const event = new CustomEvent('toggle-drawer');
              window.dispatchEvent(event);
            }}
          >
            <span className="material-symbols-outlined text-lg">menu</span>
          </button>
          <span className="text-xs font-mono uppercase tracking-widest text-poly-muted">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-poly-accent animate-pulse" style={{ borderRadius: '50%' }} />
            <span className="text-xs font-mono text-poly-text font-bold">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
