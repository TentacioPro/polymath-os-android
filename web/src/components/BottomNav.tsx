'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/connections', icon: 'hub', label: 'Mesh' },
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/journal', icon: 'edit_note', label: 'Journal' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-95 z-40 md:hidden"
    >
      <div
        className="flex justify-between items-center px-2 py-1.5 bg-m3-surface-container-high border border-m3-outline-variant elevation-3"
        style={{ borderRadius: '24px' }}
      >
        {/* Nav items */}
        <div className="flex items-center gap-1 pl-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-ring flex flex-col items-center min-h-11 justify-center px-3 py-1.5 rounded-2xl transition-standard ${
                  isActive
                    ? 'bg-m3-primary-container'
                    : 'hover:bg-m3-surface-container-highest'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isActive ? 'text-m3-on-primary-container' : 'text-m3-on-surface-variant'
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {isActive && (
                  <span className="text-[9px] font-semibold text-m3-on-primary-container mt-0.5 tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Capture CTA */}
        <Link
          href="/chat"
          aria-label="Capture new entry"
          className="focus-ring flex items-center gap-2 min-h-11 px-4 py-2.5 bg-m3-primary hover:opacity-90 transition-standard"
          style={{ borderRadius: '16px' }}
        >
          <span className="material-symbols-outlined text-[18px] text-m3-on-primary" aria-hidden="true">
            add
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase text-m3-on-primary">
            Capture
          </span>
        </Link>
      </div>
    </nav>
  );
}
