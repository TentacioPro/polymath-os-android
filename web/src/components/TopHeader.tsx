'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/activities': 'Knowledge',
  '/journal': 'Journal',
  '/connections': 'Neural Mesh',
  '/export': 'Export',
  '/agent': 'Agent Memory',
  '/chat': 'Chat',
  '/search': 'Search',
  '/analytics': 'Analytics',
  '/alerts': 'Alerts',
  '/profile': 'Settings',
  '/appearance': 'Appearance',
  '/customize': 'Customize',
  '/integrations': 'Integrations',
};

export default function TopHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Polymath OS';
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/health`);
        if (mounted) setAlive(res.ok);
      } catch {
        if (mounted) setAlive(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-m3-surface border-b border-m3-outline-variant">
      <div
        className="px-4 py-3 flex justify-between items-center"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)' }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-m3-surface-container hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
            onClick={() => {
              const event = new CustomEvent('toggle-drawer');
              window.dispatchEvent(event);
            }}
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <span className="text-[14px] font-semibold text-m3-on-surface tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Live status chip */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
            alive ? 'bg-m3-success-container' : 'bg-m3-surface-container'
          }`}>
            <div
              className={`w-1.5 h-1.5 rounded-full ${alive ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: alive ? 'var(--m3-success)' : 'var(--m3-outline)' }}
            />
            <span className={`text-[10px] font-semibold tracking-wide uppercase ${
              alive ? 'text-m3-success' : 'text-m3-on-surface-variant'
            }`}>
              {alive ? 'LIVE' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
