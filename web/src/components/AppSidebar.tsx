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

  const renderNavItem = (item: { href: string; icon: string; label: string }) => (
    <Link
      key={item.href}
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors relative group ${
        collapsed ? 'justify-center' : ''
      } ${
        isActive(item.href)
          ? 'border-l-2 border-l-poly-accent bg-poly-border-muted/30 text-poly-text font-bold'
          : 'border-l-2 border-l-transparent text-poly-muted hover:text-poly-text hover:bg-poly-border-muted/20'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
      {!collapsed && <span className="truncate font-mono">{item.label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-poly-bg border border-poly-border text-[10px] font-mono text-poly-text whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[60]">
          {item.label}
        </span>
      )}
    </Link>
  );

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-poly-bg border-r border-poly-border z-50 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand header */}
      <div className={`border-b border-poly-border flex items-center ${collapsed ? 'justify-center p-4' : 'justify-between px-5 py-5'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-poly-accent flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-poly-accent-text">auto_awesome</span>
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-poly-text uppercase tracking-tight truncate">
                PolymathOS
              </h1>
              <p className="text-[8px] font-mono text-poly-muted uppercase tracking-widest mt-0.5">
                System // v1
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 flex items-center justify-center border border-poly-border hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-muted shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Quick actions */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-poly-border-muted">
          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/activities"
              className="border border-poly-border p-2 flex flex-col items-center gap-1 hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="text-[8px] font-mono uppercase tracking-wider">New</span>
            </Link>
            <Link
              href="/chat"
              className="border border-poly-border p-2 flex flex-col items-center gap-1 hover:bg-poly-accent hover:text-poly-accent-text transition-colors text-poly-text"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="text-[8px] font-mono uppercase tracking-wider">Chat</span>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="text-[8px] font-mono uppercase tracking-widest text-poly-dim px-2 mb-2">
            Navigation
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_LINKS.map(renderNavItem)}
        </div>

        {/* Tools section */}
        {!collapsed && (
          <p className="text-[8px] font-mono uppercase tracking-widest text-poly-dim px-2 mt-5 mb-2">
            Tools
          </p>
        )}
        {collapsed && <div className="my-3 mx-2 border-t border-poly-border-muted" />}
        <div className="space-y-0.5">
          {TOOL_LINKS.map(renderNavItem)}
        </div>
      </nav>

      {/* Theme switcher */}
      <div className={`border-t border-poly-border ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed && (
          <p className="text-[8px] font-mono uppercase tracking-widest text-poly-dim mb-2">
            Theme
          </p>
        )}
        <div className={`${collapsed ? 'flex flex-col gap-1' : 'grid grid-cols-4 gap-1'}`}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.description}
              className={`border p-1.5 text-center transition-colors ${
                theme === t.id
                  ? 'border-poly-accent bg-poly-accent text-poly-accent-text'
                  : 'border-poly-border text-poly-muted hover:text-poly-text'
              }`}
            >
              {collapsed ? (
                <div className="w-3 h-3 mx-auto" style={{ backgroundColor: t.swatch, borderRadius: '50%' }} />
              ) : (
                <span className="text-[8px] font-mono uppercase tracking-wider font-bold">
                  {t.label.split(' ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className={`border-t border-poly-border-muted flex items-center ${collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-2'}`}>
        <div className="w-1.5 h-1.5 bg-poly-accent shrink-0" style={{ borderRadius: '50%' }} />
        {!collapsed && (
          <span className="text-[8px] font-mono text-poly-dim uppercase tracking-widest">
            Polymath OS
          </span>
        )}
      </div>
    </aside>
  );
}
