'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';

const NAV_LINKS = [
  { href: '/', icon: 'home', label: 'Dashboard' },
  { href: '/activities', icon: 'folder_open', label: 'Knowledge' },
  { href: '/connections', icon: 'hub', label: 'Neural Mesh' },
  { href: '/journal', icon: 'edit_note', label: 'Journal' },
  { href: '/chat', icon: 'chat_bubble_outline', label: 'Chat' },
];

const TOOL_LINKS = [
  { href: '/search', icon: 'search', label: 'Search' },
  { href: '/analytics', icon: 'bar_chart', label: 'Analytics' },
  { href: '/integrations', icon: 'extension', label: 'Integrations' },
  { href: '/export', icon: 'file_download', label: 'Export' },
  { href: '/customize', icon: 'tune', label: 'Customize' },
  { href: '/profile', icon: 'settings', label: 'Settings' },
];

export default function Drawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, cycleTheme } = useTheme();

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

  const currentTheme = THEMES.find((t) => t.id === theme);

  return (
    <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
      {/* Overlay — matching mobile 60% opacity */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Drawer panel — matching mobile dark bg #0A0A0A */}
      <aside
        className="absolute top-0 left-0 w-[78%] max-w-[300px] min-h-screen flex flex-col"
        style={{ backgroundColor: '#0A0A0A' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — matches mobile AppDrawer */}
        <div className="px-4 pt-[env(safe-area-inset-top,16px)] pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-poly-accent flex items-center justify-center" style={{ borderRadius: '10px' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#000' }}>auto_awesome</span>
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-tight">
                PolymathOS
              </h1>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 flex items-center justify-center text-white"
            style={{ backgroundColor: '#161616', borderRadius: '10px' }}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation — matching mobile style */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar">
          {/* Main Nav */}
          <div className="space-y-2">
            {NAV_LINKS.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 transition-colors text-white"
                  style={{ backgroundColor: '#161616', borderRadius: '12px' }}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#888888]">{item.icon}</span>
                  <span className="flex-1 text-[14px] font-medium">{item.label}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#888888]">chevron_right</span>
                </Link>
              );
            })}
          </div>

          {/* Tools Section */}
          <p className="text-[10px] font-semibold tracking-[2px] text-[#888888] mt-5 mb-2 ml-2 uppercase">
            TOOLS
          </p>
          <div className="space-y-2">
            {TOOL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 transition-colors text-white"
                style={{ backgroundColor: '#161616', borderRadius: '12px' }}
              >
                <span className="material-symbols-outlined text-[20px] text-[#888888]">{item.icon}</span>
                <span className="flex-1 text-[14px] font-medium">{item.label}</span>
                <span className="material-symbols-outlined text-[18px] text-[#888888]">chevron_right</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer — Theme Toggle (matching mobile) */}
        <div className="px-4 py-3">
          <button
            onClick={cycleTheme}
            className="flex items-center gap-3 w-full px-3 py-3 transition-colors text-white"
            style={{ backgroundColor: '#161616', borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined text-[20px] text-poly-accent">palette</span>
            <div className="flex-1 text-left">
              <span className="block text-[13px] font-semibold text-white">Theme</span>
              <span className="block text-[10px] font-bold tracking-[1px] text-poly-accent uppercase mt-0.5">
                {currentTheme?.label}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#888888]">sync</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
