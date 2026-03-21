'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { THEMES } from '@/lib/theme';
import { useSidebar } from '@/hooks/useSidebar';

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

export default function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { collapsed, setCollapsed } = useSidebar();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const renderNavItem = (item: { href: string; icon: string; label: string }) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
        className={`focus-ring group relative flex items-center gap-3 transition-standard ${
          collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
        } rounded-[16px] min-h-[44px] ${
          active
            ? 'bg-m3-primary-container text-m3-on-primary-container font-semibold'
            : 'text-m3-on-surface-variant hover:bg-m3-surface-container-high hover:text-m3-on-surface'
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${
          active ? 'text-m3-on-primary-container' : ''
        }`} aria-hidden="true">
          {item.icon}
        </span>
        {!collapsed && (
          <span className="truncate text-[13px] tracking-tight">{item.label}</span>
        )}
        {/* Collapsed tooltip */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-3 py-1.5 bg-m3-inverse-surface text-m3-inverse-on-surface text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-standard z-[60] elevation-3">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-m3-surface z-50 transition-standard border-r border-m3-outline-variant ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand header */}
      <div className={`flex items-center border-b border-m3-outline-variant ${
        collapsed ? 'justify-center p-3' : 'justify-between px-4 py-4'
      }`}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[14px] bg-m3-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-m3-on-primary">
                auto_awesome
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[14px] font-bold text-m3-on-surface tracking-tight truncate">
                Polymath OS
              </h1>
              <p className="text-[10px] text-m3-on-surface-variant tracking-wide mt-0.5">
                v1.0 System
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="focus-ring w-11 h-11 rounded-xl flex items-center justify-center hover:bg-m3-surface-container-high transition-standard text-m3-on-surface-variant hover:text-m3-on-surface shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Quick actions */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-m3-outline-variant">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/activities"
              className="rounded-2xl bg-m3-surface-container p-2.5 flex flex-col items-center gap-1.5 hover:bg-m3-surface-container-high transition-standard text-m3-on-surface"
            >
              <span className="material-symbols-outlined text-[18px] text-m3-primary">add</span>
              <span className="text-[10px] font-medium tracking-wide">New</span>
            </Link>
            <Link
              href="/chat"
              className="rounded-2xl bg-m3-primary-container p-2.5 flex flex-col items-center gap-1.5 hover:opacity-90 transition-standard text-m3-on-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="text-[10px] font-medium tracking-wide">Chat</span>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant px-3 mb-2">
            Navigation
          </p>
        )}
        <div className="space-y-1">
          {NAV_LINKS.map(renderNavItem)}
        </div>

        {/* Tools section */}
        {!collapsed && (
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant px-3 mt-5 mb-2">
            Tools
          </p>
        )}
        {collapsed && <div className="my-3 mx-3 border-t border-m3-outline-variant" />}
        <div className="space-y-1">
          {TOOL_LINKS.map(renderNavItem)}
        </div>
      </nav>

      {/* Theme switcher */}
      <div className={`border-t border-m3-outline-variant ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed && (
          <p className="text-[11px] font-medium tracking-wide text-m3-on-surface-variant mb-2 px-1">
            Theme
          </p>
        )}
        <div className={`${collapsed ? 'flex flex-col gap-1.5 items-center' : 'grid grid-cols-4 gap-1.5'}`}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-label={t.description}
              aria-pressed={theme === t.id}
              title={t.description}
              className={`focus-ring min-h-[44px] min-w-[44px] rounded-xl p-1.5 text-center transition-standard ${
                theme === t.id
                  ? 'bg-m3-primary-container ring-1 ring-m3-primary'
                  : 'bg-m3-surface-container hover:bg-m3-surface-container-high'
              }`}
            >
              {collapsed ? (
                <div
                  className="w-4 h-4 mx-auto rounded-full ring-1 ring-m3-outline-variant"
                  style={{ backgroundColor: t.swatch }}
                />
              ) : (
                <span className={`text-[9px] font-semibold tracking-wide ${
                  theme === t.id ? 'text-m3-on-primary-container' : 'text-m3-on-surface-variant'
                }`}>
                  {t.label.split(' ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status pill */}
      <div className={`border-t border-m3-outline-variant flex items-center ${
        collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-2.5'
      }`}>
        <div className="w-2 h-2 rounded-full bg-m3-success shrink-0 animate-pulse" />
        {!collapsed && (
          <span className="text-[11px] text-m3-on-surface-variant font-medium tracking-wide">
            Polymath OS
          </span>
        )}
      </div>
    </aside>
  );
}
