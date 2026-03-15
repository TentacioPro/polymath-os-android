'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/connections', icon: 'hub', label: 'Mesh' },
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/journal', icon: 'edit_note', label: 'Journal' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-40 md:hidden">
      <div
        className="flex justify-between items-center px-2 py-1.5"
        style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid var(--poly-border)',
          boxShadow: '4px 4px 0 0 var(--poly-shadow)',
          borderRadius: '16px',
        }}
      >
        {/* Nav icons */}
        <div className="flex items-center gap-5 pl-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center transition-colors"
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: isActive ? 'var(--poly-accent)' : '#666666' }}
                >
                  {item.icon}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Quick Capture button — matching mobile pill */}
        <Link
          href="/chat"
          className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
          style={{
            backgroundColor: 'var(--poly-accent)',
            borderRadius: '12px',
          }}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: '#000' }}
          >
            add
          </span>
          <span className="text-[11px] font-bold tracking-[1px] uppercase" style={{ color: '#000' }}>
            CAPTURE
          </span>
        </Link>
      </div>
    </div>
  );
}
