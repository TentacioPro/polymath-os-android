'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';

const NAV_LINKS = [
  { href: '/', icon: 'dashboard', label: 'Dashboard' },
  { href: '/activities', icon: 'list', label: 'Activities' },
  { href: '/journal', icon: 'menu_book', label: 'Journal' },
  { href: '/connections', icon: 'hub', label: 'Neural Mesh' },
  { href: '/agent', icon: 'memory', label: 'Agent Memory' },
  { href: '/export', icon: 'download', label: 'Export & Import' },
];

export default function Drawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Listen for toggle event from header
  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    window.addEventListener('toggle-drawer', handler);
    return () => window.removeEventListener('toggle-drawer', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-[var(--poly-overlay)] backdrop-blur-sm" />

      {/* Drawer panel */}
      <aside
        className="absolute top-0 left-0 w-[85%] max-w-sm min-h-screen bg-poly-bg border-r border-poly-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-poly-border flex justify-between items-center">
          <div>
            <h1 className="font-display text-xl font-bold text-poly-text uppercase tracking-tight">
              Polymath OS
            </h1>
            <p className="text-[10px] font-mono text-poly-muted uppercase tracking-widest mt-1">
              System // Navigation
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center border border-poly-border hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-poly-border-muted">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/activities"
              className="border border-poly-border p-3 flex flex-col items-center gap-1.5 hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span className="text-[10px] font-mono uppercase tracking-wider">
                New Entry
              </span>
            </Link>
            <Link
              href="/agent"
              className="border border-poly-border p-3 flex flex-col items-center gap-1.5 hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
            >
              <span className="material-symbols-outlined text-[20px]">
                chat
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Agent Chat
              </span>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
          <p className="text-[9px] font-mono uppercase tracking-widest text-poly-dim px-3 mb-2">
            Navigation
          </p>
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-mono transition-colors ${
                  isActive
                    ? 'border-l-2 border-l-poly-accent bg-poly-border-muted/30 text-poly-text font-bold'
                    : 'border-l-2 border-l-transparent text-poly-muted hover:text-poly-text hover:bg-poly-border-muted/20'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Switcher */}
        <div className="p-4 border-t border-poly-border">
          <p className="text-[9px] font-mono uppercase tracking-widest text-poly-dim mb-3">
            Theme
          </p>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex-1 border p-2 text-center transition-colors ${
                  theme === t.id
                    ? 'border-poly-accent bg-poly-accent text-poly-accent-text'
                    : 'border-poly-border text-poly-muted hover:text-poly-text'
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-poly-border-muted flex justify-between items-center">
          <span className="text-[9px] font-mono text-poly-dim uppercase tracking-widest">
            Current: {THEMES.find((t) => t.id === theme)?.label}
          </span>
          <Link
            href="/export"
            className="text-[9px] font-mono text-poly-muted hover:text-poly-text uppercase tracking-widest"
          >
            Settings
          </Link>
        </div>
      </aside>
    </div>
  );
}
