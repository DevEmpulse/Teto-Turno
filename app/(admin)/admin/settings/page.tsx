'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineUser,
  HiOutlineBuildingStorefront,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlinePaintBrush,
  HiOutlineGlobeAlt,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';

interface SettingsSection {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Perfil',
    description: 'Tu información personal y datos de cuenta',
    icon: HiOutlineUser,
    href: '/admin/settings/profile',
  },
  {
    title: 'Negocio',
    description: 'Información de tu negocio, horarios y ubicación',
    icon: HiOutlineBuildingStorefront,
    href: '/admin/settings/business',
  },
  {
    title: 'Notificaciones',
    description: 'Configura alertas y recordatorios',
    icon: HiOutlineBell,
    href: '/admin/settings/notifications',
  },
  {
    title: 'Seguridad',
    description: 'Contraseña, autenticación y permisos',
    icon: HiOutlineShieldCheck,
    href: '/admin/settings/security',
  },
  {
    title: 'Apariencia',
    description: 'Personaliza la página de reservas',
    icon: HiOutlinePaintBrush,
    href: '/admin/settings/appearance',
    badge: 'Nuevo',
  },
  {
    title: 'Integraciones',
    description: 'Conecta con Google Calendar, WhatsApp y más',
    icon: HiOutlineGlobeAlt,
    href: '/admin/settings/integrations',
  },
  {
    title: 'Facturación',
    description: 'Plan actual, facturas y métodos de pago',
    icon: HiOutlineCreditCard,
    href: '/admin/settings/billing',
  },
  {
    title: 'Equipo',
    description: 'Administra usuarios y permisos del sistema',
    icon: HiOutlineUserGroup,
    href: '/admin/settings/team',
  },
];

export default function SettingsPage() {
  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Configuración
        </h1>
        <p className="mt-1 text-surface-500">
          Administra las preferencias de tu cuenta y negocio
        </p>
      </div>

      {/* Settings grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card
              variant="interactive"
              className="h-full transition-all hover:shadow-lg hover:shadow-primary-500/10"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                      {section.title}
                    </h3>
                    {section.badge && (
                      <Badge variant="default" size="sm">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-surface-500 line-clamp-1">
                    {section.description}
                  </p>
                </div>
                <HiOutlineChevronRight className="h-5 w-5 text-surface-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Current plan */}
      <Card variant="gradient">
        <CardContent className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Plan Pro
              </h3>
              <Badge variant="glow">Activo</Badge>
            </div>
            <p className="mt-1 text-surface-500">
              Citas ilimitadas • Hasta 5 profesionales • Soporte prioritario
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-surface-300 bg-white px-4 py-2 text-sm font-medium text-surface-700 transition-all hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700">
              Ver Facturas
            </button>
            <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 hover:shadow-glow">
              Cambiar Plan
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card variant="elevated" className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-50">
                Eliminar Cuenta
              </p>
              <p className="text-sm text-surface-500">
                Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
              </p>
            </div>
            <button className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-900 dark:bg-surface-900 dark:hover:bg-red-900/20">
              Eliminar Cuenta
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

