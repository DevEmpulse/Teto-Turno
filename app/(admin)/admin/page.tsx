'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineBuildingStorefront,
  HiOutlineScissors,
  HiOutlineUsers,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlinePlus,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Avatar } from '@/presentation/components/ui/avatar';

type Business = {
  id: string;
  name: string;
  slug: string;
};

type Service = {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
};

type Staff = {
  id: string;
  full_name: string;
  email: string;
  title: string | null;
  status: 'active' | 'inactive' | 'on_leave';
};

const quickActions = [
  {
    title: 'Calendario',
    description: 'Ver agenda del día',
    href: '/admin/calendar',
    icon: HiOutlineCalendar,
    color: 'bg-accent-600 text-white',
  },
  {
    title: 'Servicios',
    description: 'Gestionar servicios',
    href: '/admin/services',
    icon: HiOutlineScissors,
    color: 'bg-green-600 text-white',
  },
  {
    title: 'Staff',
    description: 'Gestionar profesionales',
    href: '/admin/staff',
    icon: HiOutlineUsers,
    color: 'bg-primary-600 text-white',
  },
  {
    title: 'Reportes',
    description: 'Ver estadísticas',
    href: '/admin/reports',
    icon: HiOutlineChartBar,
    color: 'bg-orange-600 text-white',
  },
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const businessesRes = await fetch('/api/businesses', { cache: 'no-store' });
        const businessesJson = (await businessesRes.json()) as { businesses?: Business[]; error?: string };

        if (!businessesRes.ok) {
          setError(businessesJson.error ?? 'No se pudieron cargar los negocios');
          setIsLoading(false);
          return;
        }

        const fetchedBusinesses = businessesJson.businesses ?? [];
        setBusinesses(fetchedBusinesses);

        const businessId = fetchedBusinesses[0]?.id;
        if (!businessId) {
          setServices([]);
          setStaff([]);
          setIsLoading(false);
          return;
        }

        const [servicesRes, staffRes] = await Promise.all([
          fetch(`/api/services?businessId=${businessId}`, { cache: 'no-store' }),
          fetch(`/api/staff?businessId=${businessId}`, { cache: 'no-store' }),
        ]);

        const servicesJson = (await servicesRes.json()) as { services?: Service[]; error?: string };
        const staffJson = (await staffRes.json()) as { staff?: Staff[]; error?: string };

        if (!servicesRes.ok) {
          setError(servicesJson.error ?? 'No se pudieron cargar los servicios');
        } else {
          setServices(servicesJson.services ?? []);
        }

        if (!staffRes.ok) {
          setError((prev) => prev ?? staffJson.error ?? 'No se pudo cargar el staff');
        } else {
          setStaff(staffJson.staff ?? []);
        }
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const activeServices = services.filter((service) => service.status === 'active').length;
  const activeStaff = staff.filter((person) => person.status === 'active').length;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Dashboard</h1>
        <p className="mt-1 text-surface-500">Resumen de datos conectados a tus APIs.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 dark:text-surface-50">{action.title}</p>
                  <p className="text-sm text-surface-500">{action.description}</p>
                </div>
                <HiOutlineArrowRight className="h-5 w-5 text-surface-400 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Negocios</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">{isLoading ? '...' : businesses.length}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Servicios</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">{isLoading ? '...' : services.length}</p>
            <p className="mt-1 text-sm text-green-600">{activeServices} activos</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Staff</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">{isLoading ? '...' : staff.length}</p>
            <p className="mt-1 text-sm text-green-600">{activeStaff} activos</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Negocio activo</p>
            <p className="mt-2 text-lg font-semibold text-surface-900 dark:text-surface-50">
              {isLoading ? 'Cargando...' : businesses[0]?.name ?? 'Sin negocios'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineBuildingStorefront className="h-5 w-5" />
              Negocios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {businesses.length === 0 ? (
              <p className="text-sm text-surface-500">No hay negocios registrados.</p>
            ) : (
              <div className="space-y-3">
                {businesses.map((business) => (
                  <div key={business.id} className="rounded-xl border border-surface-200 p-4 dark:border-surface-800">
                    <p className="font-medium text-surface-900 dark:text-surface-50">{business.name}</p>
                    <p className="text-sm text-surface-500">/{business.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Staff</span>
              <Link href="/admin/staff" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Ver todo
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <p className="text-sm text-surface-500">No hay staff para el negocio seleccionado.</p>
            ) : (
              <div className="space-y-3">
                {staff.slice(0, 5).map((person) => (
                  <div key={person.id} className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 dark:border-surface-800">
                    <Avatar name={person.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-surface-900 dark:text-surface-50">{person.full_name}</p>
                      <p className="truncate text-xs text-surface-500">{person.email}</p>
                    </div>
                    <span className="rounded-full bg-surface-100 px-2 py-1 text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-300">
                      {person.title ?? 'Sin título'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                Crea tu primer negocio
              </h3>
              <p className="text-surface-500">Si aún no tienes uno, puedes crearlo desde tu dashboard.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-all hover:bg-primary-700"
            >
              <HiOutlinePlus className="mr-2 h-5 w-5" />
              Ir a crear negocio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
