'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '../ui/avatar';
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineChevronRight,
  HiOutlineHome,
} from 'react-icons/hi2';

interface NavbarProps {
  onMenuClick: () => void;
}

// Breadcrumb configuration
const routeLabels: Record<string, string> = {
  admin: 'Dashboard',
  calendar: 'Calendario',
  appointments: 'Citas',
  staff: 'Personal',
  services: 'Servicios',
  finance: 'Finanzas',
  reports: 'Reportes',
  settings: 'Configuración',
  profile: 'Perfil',
  business: 'Negocio',
  notifications: 'Notificaciones',
  security: 'Seguridad',
  appearance: 'Apariencia',
  integrations: 'Integraciones',
  billing: 'Facturación',
  team: 'Equipo',
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; href: string }[] = [];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      breadcrumbs.push({ label, href: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex flex-col border-b px-4 lg:px-6',
        'bg-white/80 backdrop-blur-xl border-surface-200',
        'dark:bg-surface-950/80 dark:border-surface-800'
      )}
    >
      {/* Main navbar row */}
      <div className="flex h-16 items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={cn(
            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl lg:hidden',
            'hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
        >
          <HiOutlineBars3 className="h-6 w-6" />
        </button>

        {/* Breadcrumbs - Desktop */}
        <nav className="hidden flex-1 items-center gap-1 text-sm lg:flex">
          <Link
            href="/admin"
            className="flex items-center gap-1 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
          >
            <HiOutlineHome className="h-4 w-4" />
          </Link>
          {breadcrumbs.slice(1).map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <HiOutlineChevronRight className="h-4 w-4 text-surface-400" />
              {index === breadcrumbs.length - 2 ? (
                <span className="font-medium text-surface-900 dark:text-surface-50">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Page title - Mobile */}
        <div className="flex-1 lg:hidden">
          <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </h1>
        </div>

        {/* Search */}
        <div
          className={cn(
            'hidden items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 md:flex',
            'bg-surface-50 dark:bg-surface-900 dark:border-surface-700',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'
          )}
        >
          <HiOutlineMagnifyingGlass className="h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-48 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
          />
          <kbd className="hidden rounded bg-surface-200 px-1.5 py-0.5 text-xs text-surface-500 dark:bg-surface-700 lg:inline">
            ⌘K
          </kbd>
        </div>

        {/* Mobile search button */}
        <button
          className={cn(
            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl md:hidden',
            'hover:bg-surface-100 dark:hover:bg-surface-800'
          )}
        >
          <HiOutlineMagnifyingGlass className="h-5 w-5" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl',
              'hover:bg-surface-100 dark:hover:bg-surface-800',
              'transition-colors duration-200'
            )}
          >
            {isDark ? (
              <HiOutlineSun className="h-5 w-5" />
            ) : (
              <HiOutlineMoon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button
            className={cn(
              'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl',
              'hover:bg-surface-100 dark:hover:bg-surface-800'
            )}
          >
            <HiOutlineBell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User menu */}
          <Link
            href="/admin/settings/profile"
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-1.5',
              'hover:bg-surface-100 dark:hover:bg-surface-800',
              'transition-colors duration-200'
            )}
          >
            <Avatar name="Admin User" size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                Admin User
              </p>
              <p className="text-xs text-surface-500">Administrador</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick navigation tabs - shown on main sections */}
      {pathname.startsWith('/admin/settings') && (
        <QuickNav
          items={[
            { label: 'Perfil', href: '/admin/settings/profile' },
            { label: 'Negocio', href: '/admin/settings/business' },
            { label: 'Notificaciones', href: '/admin/settings/notifications' },
            { label: 'Seguridad', href: '/admin/settings/security' },
            { label: 'Apariencia', href: '/admin/settings/appearance' },
            { label: 'Integraciones', href: '/admin/settings/integrations' },
            { label: 'Facturación', href: '/admin/settings/billing' },
            { label: 'Equipo', href: '/admin/settings/team' },
          ]}
          basePath="/admin/settings"
        />
      )}
    </header>
  );
}

interface QuickNavProps {
  items: { label: string; href: string }[];
  basePath: string;
}

function QuickNav({ items, basePath }: QuickNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto pb-3 -mx-4 px-4 lg:-mx-6 lg:px-6 scrollbar-hide">
      <Link
        href={basePath}
        className={cn(
          'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
          pathname === basePath
            ? 'bg-primary-600 text-white'
            : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
        )}
      >
        General
      </Link>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            pathname === item.href
              ? 'bg-primary-600 text-white'
              : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
