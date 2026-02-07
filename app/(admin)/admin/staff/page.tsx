'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineCalendarDays,
  HiOutlineScissors,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { cn } from '@/lib/utils';

const staffTabs = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
  { id: 'on_leave', label: 'En Licencia' },
] as const;

type StaffStatus = 'active' | 'inactive' | 'on_leave';

type Business = {
  id: string;
  name: string;
};

type StaffMember = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  status: StaffStatus;
  color: string;
};

const statusConfig: Record<StaffStatus, { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  on_leave: { label: 'De licencia', variant: 'warning' },
};

export default function StaffPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof staffTabs)[number]['id']>('all');
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch('/api/businesses', { cache: 'no-store' });
        const json = (await res.json()) as { businesses?: Business[]; error?: string };

        if (!res.ok) {
          setErrorMessage(json.error ?? 'No se pudieron cargar los negocios');
          setIsLoading(false);
          return;
        }

        const fetchedBusinesses = json.businesses ?? [];
        setBusinesses(fetchedBusinesses);
        setSelectedBusinessId(fetchedBusinesses[0]?.id ?? '');
      } catch {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    const loadStaff = async () => {
      if (!selectedBusinessId) {
        setStaff([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/staff?businessId=${selectedBusinessId}`, { cache: 'no-store' });
        const json = (await res.json()) as { staff?: StaffMember[]; error?: string };

        if (!res.ok) {
          setErrorMessage(json.error ?? 'No se pudo cargar el personal');
          setStaff([]);
          return;
        }

        setStaff(json.staff ?? []);
      } catch {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
        setStaff([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStaff();
  }, [selectedBusinessId]);

  const filteredStaff = activeTab === 'all' ? staff : staff.filter((person) => person.status === activeTab);
  const activeStaff = staff.filter((person) => person.status === 'active').length;

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Personal</h1>
          <p className="mt-1 text-surface-500">Datos consumidos desde `/api/staff`.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-64">
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
          >
            {businesses.length === 0 ? (
              <option value="">Sin negocios</option>
            ) : (
              businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {staffTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/calendar"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineCalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Horarios</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineScissors className="h-4 w-4" />
            <span className="hidden sm:inline">Servicios</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Total Profesionales</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">{isLoading ? '...' : staff.length}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{isLoading ? '...' : activeStaff}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">En filtro actual</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">{isLoading ? '...' : filteredStaff.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredStaff.map((person) => (
          <Card key={person.id} variant="elevated" className="card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className="h-2" style={{ backgroundColor: person.color }} />

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={person.full_name} size="lg" />
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-50">{person.full_name}</h3>
                      <p className="text-sm text-primary-600">{person.title ?? 'Sin título'}</p>
                    </div>
                  </div>
                  <Badge variant={statusConfig[person.status].variant}>{statusConfig[person.status].label}</Badge>
                </div>

                <div className="mt-4 space-y-1 text-sm text-surface-500">
                  <p>{person.email}</p>
                  {person.phone && <p>{person.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filteredStaff.length === 0 && (
        <Card variant="elevated">
          <CardContent className="py-12 text-center">
            <p className="text-surface-500">No hay personal para mostrar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
