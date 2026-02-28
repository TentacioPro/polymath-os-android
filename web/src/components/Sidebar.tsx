'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  BookOpen,
  GitBranch,
  Download,
  Brain,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activities', label: 'Activities', icon: List },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/connections', label: 'Connections', icon: GitBranch },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/agent', label: 'Agent', icon: Brain },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-poly-card border-r border-poly-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-poly-border">
        <h1 className="text-xl font-bold text-poly-text">Polymath OS</h1>
        <p className="text-xs text-poly-muted mt-1">Track, Learn, Connect</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-poly-indigo/15 text-poly-indigo'
                  : 'text-poly-muted hover:text-poly-text hover:bg-poly-border/40'
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-poly-border">
        <p className="text-[11px] text-poly-dim">Polymath OS Web</p>
      </div>
    </aside>
  );
}
