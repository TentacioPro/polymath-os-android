'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: 'dashboard', label: 'Dash' },
  { href: '/connections', icon: 'hub', label: 'Mesh' },
  { href: '/agent', icon: 'memory', label: 'Agent' },
  { href: '/export', icon: 'download', label: 'Export' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-40 md:hidden">
      <div className="bg-poly-bg text-poly-text border border-poly-border architect-shadow flex justify-between items-center p-1.5 pl-4 pr-1.5">
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  isActive
                    ? 'text-poly-accent'
                    : 'text-poly-muted hover:text-poly-text'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
              </Link>
            );
          })}
        </div>
        <Link
          href="/activities"
          className="bg-poly-accent text-poly-accent-text w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </Link>
      </div>
    </div>
  );
}
