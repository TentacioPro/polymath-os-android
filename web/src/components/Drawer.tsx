'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';
import ResponsiveModal from './ResponsiveModal';

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
  { href: '/agent', icon: 'memory', label: 'Agent Memory' },
  { href: '/integrations', icon: 'extension', label: 'Integrations' },
  { href: '/export', icon: 'file_download', label: 'Export' },
  { href: '/customize', icon: 'tune', label: 'Customize' },
  { href: '/profile', icon: 'settings', label: 'Settings' },
];

export default function Drawer() {
  const [open, setOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, cycleTheme } = useTheme();

  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    window.addEventListener('toggle-drawer', handler);
    return () => window.removeEventListener('toggle-drawer', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!open) return null;

  const currentTheme = THEMES.find((t) => t.id === theme);

  const renderLink = (item: { href: string; icon: string; label: string }) => {
    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-standard ${
          active
            ? 'bg-m3-primary-container text-m3-on-primary-container font-semibold'
            : 'text-m3-on-surface hover:bg-m3-surface-container-highest'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${
          active ? 'text-m3-on-primary-container' : 'text-m3-on-surface-variant'
        }`}>
          {item.icon}
        </span>
        <span className="flex-1 text-[14px]">{item.label}</span>
        <span className="material-symbols-outlined text-[18px] text-m3-on-surface-variant">
          chevron_right
        </span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-60 md:hidden" onClick={() => setOpen(false)}>
      {/* Scrim overlay */}
      <div className="absolute inset-0 glass-overlay" aria-hidden="true" />

      {/* Drawer panel */}
      <aside
        className="absolute top-0 left-0 w-[80%] max-w-80 min-h-screen flex flex-col bg-m3-surface-container elevation-4"
        style={{ borderRadius: '0 28px 28px 0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 pb-4 flex justify-between items-center"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 20px), 20px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-m3-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-m3-on-primary">auto_awesome</span>
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-m3-on-surface tracking-tight">
                Polymath OS
              </h1>
              <p className="text-[11px] text-m3-on-surface-variant mt-0.5">
                Knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation drawer"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-m3-surface-container-high hover:bg-m3-surface-container-highest transition-standard text-m3-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-m3-outline-variant" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {NAV_LINKS.map(renderLink)}
          </div>

          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mt-5 mb-2 ml-4">
            Tools
          </p>
          <div className="space-y-1">
            {TOOL_LINKS.map(renderLink)}
            
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-standard text-m3-error hover:bg-m3-error-container hover:text-m3-on-error-container mt-4"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>
              <span className="flex-1 text-left text-[14px] font-semibold">Log Out</span>
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Logout Modal */}
      <ResponsiveModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
        maxWidth="max-w-sm"
      >
        <p className="text-[14px] text-m3-on-surface-variant mb-6">
          Are you sure you want to securely log out of your current session? You will need to re-authenticate to access Polymath OS.
        </p>
        <div className="flex justify-end gap-3 pb-2">
          <button
            onClick={() => setLogoutModalOpen(false)}
            className="px-5 py-2.5 rounded-full text-[14px] font-medium text-m3-on-surface hover:bg-m3-surface-container-high transition-standard"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setLogoutModalOpen(false);
              setOpen(false);
              localStorage.removeItem('api_token');
              router.push('/login');
            }}
            className="px-5 py-2.5 rounded-full text-[14px] font-medium bg-m3-error text-m3-on-error hover:opacity-90 transition-standard elevation-1"
          >
            Log Out Securely
          </button>
        </div>
      </ResponsiveModal>
    </div>
  );
}
