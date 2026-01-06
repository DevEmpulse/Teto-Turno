'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineChartBar,
  HiOutlineSquares2X2,
  HiOutlineScissors,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi2';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: HiOutlineSquares2X2 },
  { label: 'Calendario', href: '/admin/calendar', icon: HiOutlineCalendar },
  { label: 'Citas', href: '/admin/appointments', icon: HiOutlineCalendarDays },
];

const managementNavItems: NavItem[] = [
  { label: 'Personal', href: '/admin/staff', icon: HiOutlineUsers },
  { label: 'Servicios', href: '/admin/services', icon: HiOutlineScissors },
];

const financeNavItems: NavItem[] = [
  { label: 'Finanzas', href: '/admin/finance', icon: HiOutlineBanknotes },
  { label: 'Reportes', href: '/admin/reports', icon: HiOutlineChartBar },
];

const settingsNavItems: NavItem[] = [
  { label: 'Configuración', href: '/admin/settings', icon: HiOutlineCog6Tooth },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const NavSection = ({
    title,
    items,
  }: {
    title?: string;
    items: NavItem[];
  }) => (
    <div className="space-y-1">
      {title && (
        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
          {title}
        </p>
      )}
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-3',
              'transition-all duration-200',
              active
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-surface-400 hover:bg-surface-800 hover:text-white'
            )}
          >
            <item.icon
              className={cn(
                'h-5 w-5 shrink-0 transition-transform',
                !active && 'group-hover:scale-110'
              )}
            />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-semibold">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col',
          'bg-surface-950 text-white',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <span className="text-lg font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Teto</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-surface-800 lg:hidden"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <NavSection items={mainNavItems} />
          <NavSection title="Gestión" items={managementNavItems} />
          <NavSection title="Finanzas" items={financeNavItems} />
          <NavSection title="Sistema" items={settingsNavItems} />
        </nav>

        {/* Quick actions */}
        <div className="border-t border-surface-800 p-4">
          {/* Help card */}
          <div className="rounded-xl bg-gradient-to-r from-primary-600/20 to-accent-600/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-800">
                <HiOutlineQuestionMarkCircle className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-200">¿Necesitas ayuda?</p>
                <p className="text-xs text-surface-400">Centro de soporte</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-surface-400 transition-colors hover:bg-surface-800 hover:text-white">
            <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
