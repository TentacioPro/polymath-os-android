'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

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
  const title = PAGE_TITLES[pathname] || 'PolymathOS';
  const [alive, setAlive] = useState(false);

  // Wire LIVE indicator to /api/health
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
    <header
      className="fixed top-0 left-0 right-0 z-50 md:hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <div className="px-4 py-3 flex justify-between items-center" style={{ paddingTop: 'max(env(safe-area-inset-top, 12px), 12px)' }}>
        <div className="flex items-center gap-3">
          {/* Hamburger — matching mobile style */}
          <button
            className="flex items-center justify-center w-9 h-9 transition-colors text-white"
            style={{ backgroundColor: '#161616', borderRadius: '10px' }}
            onClick={() => {
              const event = new CustomEvent('toggle-drawer');
              window.dispatchEvent(event);
            }}
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <span className="text-[13px] font-semibold text-white tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Live status dot */}
          <div className="flex items-center gap-1.5">
            <div
              className={alive ? 'animate-pulse' : ''}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: alive ? 'var(--poly-accent)' : '#444',
              }}
            />
            <span className="text-[10px] font-bold tracking-[1px] uppercase" style={{ color: alive ? 'var(--poly-accent)' : '#666' }}>
              {alive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
