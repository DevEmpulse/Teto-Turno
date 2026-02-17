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
  HiOutlineLink,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type Business = {
  id: string;
  name: string;
  slug: string;
};

type Service = {
  id: string;
  name: string;
  status: string;
};

type Staff = {
  id: string;
  full_name: string;
  email: string;
  title: string | null;
  status: string;
  color?: string;
};

type AppointmentApi = {
  id: string;
  scheduled_at: string;
  status: string;
  customers?: { full_name?: string | null; email?: string | null; phone?: string | null } | null;
  services?: { name?: string | null } | null;
  staff?: { full_name?: string | null; title?: string | null } | null;
};

const quickActions = [
  { title: 'Calendario', description: 'Ver agenda del día', href: '/admin/calendar', icon: HiOutlineCalendar, color: 'bg-accent-600 text-white' },
  { title: 'Servicios', description: 'Gestionar servicios', href: '/admin/services', icon: HiOutlineScissors, color: 'bg-green-600 text-white' },
  { title: 'Staff', description: 'Gestionar profesionales', href: '/admin/staff', icon: HiOutlineUsers, color: 'bg-primary-600 text-white' },
  { title: 'Reportes', description: 'Ver estadísticas', href: '/admin/reports', icon: HiOutlineChartBar, color: 'bg-orange-600 text-white' },
];

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_show: 'No asistió',
  };
  return map[status] ?? status;
}

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
  if (status === 'confirmed' || status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled' || status === 'no_show') return 'danger';
  if (status === 'in_progress') return 'info';
  return 'secondary';
}

function getClientName(a: AppointmentApi): string {
  return a.customers?.full_name?.trim() || 'Cliente Invitado';
}

function getServiceName(a: AppointmentApi): string {
  return a.services?.name?.trim() || 'Servicio no definido';
}

function getStaffName(a: AppointmentApi): string {
  const s = a.staff;
  if (s?.full_name) return s.full_name.trim();
  if (s?.title) return s.title.trim();
  return 'Profesional';
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [services, setServices] = React.useState<Service[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [staffWorkingToday, setStaffWorkingToday] = React.useState<Staff[]>([]);
  const [appointments, setAppointments] = React.useState<AppointmentApi[]>([]);
  const [copied, setCopied] = React.useState(false);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const bookingUrl =
    typeof window !== 'undefined' && selectedBusiness
      ? `${window.location.origin}/book/${selectedBusiness.slug}`
      : '';

  const todayStart = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const todayEnd = React.useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const appointmentsToday = React.useMemo(() => {
    return appointments
      .filter((a) => {
        const t = new Date(a.scheduled_at).getTime();
        return t >= todayStart && t <= todayEnd && !['cancelled', 'no_show'].includes(a.status);
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [appointments, todayStart, todayEnd]);

  React.useEffect(() => {
    let cancelled = false;
    const loadBusinesses = async () => {
      const res = await fetch('/api/businesses', { cache: 'no-store' });
      const json = (await res.json()) as { businesses?: Business[]; error?: string };
      if (cancelled) return;
      if (!res.ok) {
        setError(json.error ?? 'No se pudieron cargar los negocios');
        return;
      }
      const list = json.businesses ?? [];
      setBusinesses(list);
      const firstId = list[0]?.id;
      if (firstId && !selectedBusinessId) setSelectedBusinessId(firstId);
    };
    void loadBusinesses();
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (!selectedBusinessId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/services?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
      fetch(`/api/staff?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
      fetch(`/api/staff?businessId=${selectedBusinessId}&workingToday=true`, { cache: 'no-store' }),
      fetch(`/api/appointments?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
    ])
      .then(async ([s, st, stToday, a]) => {
        const [sJson, stJson, stTodayJson, aJson] = await Promise.all([
          s.json() as Promise<{ services?: Service[] }>,
          st.json() as Promise<{ staff?: Staff[] }>,
          stToday.json() as Promise<{ staff?: Staff[] }>,
          a.json() as Promise<{ appointments?: AppointmentApi[] }>,
        ]);
        if (cancelled) return;
        setServices(sJson.services ?? []);
        setStaff(stJson.staff ?? []);
        setStaffWorkingToday(stTodayJson.staff ?? []);
        setAppointments(aJson.appointments ?? []);
      })
      .catch(() => {
        if (!cancelled) setError('Error de conexión. Intenta nuevamente.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedBusinessId]);

  const handleCopyLink = async () => {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar el enlace');
    }
  };

  const activeServices = services.filter((s) => s.status === 'active').length;
  const activeStaff = staff.filter((s) => s.status === 'active').length;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Dashboard</h1>
          <p className="mt-1 text-surface-500">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }).replace(/^./, (c) =>
              c.toUpperCase()
            )}
          </p>
        </div>
        <div className="w-full sm:w-64">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-500">
            Negocio
          </label>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href} className="cursor-pointer">
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

      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Turnos de hoy ({appointmentsToday.length})</CardTitle>
          <Link
            href="/admin/calendar"
            className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Ver calendario →
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-surface-500">Cargando...</p>
          ) : appointmentsToday.length === 0 ? (
            <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-8 text-center text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
              No hay turnos para hoy.
            </div>
          ) : (
            <div className="space-y-3">
              {appointmentsToday.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col gap-2 rounded-xl border border-surface-200 bg-white px-4 py-3 dark:border-surface-800 dark:bg-surface-900 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                      {format(parseISO(apt.scheduled_at), 'HH:mm')} · {getClientName(apt)}
                    </p>
                    <p className="text-sm text-surface-500">
                      {getServiceName(apt)} · {getStaffName(apt)}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(apt.status)} dot>
                    {getStatusLabel(apt.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Negocios</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : businesses.length}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Servicios</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : services.length}
            </p>
            <p className="mt-1 text-sm text-green-600">{activeServices} activos</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Staff</p>
            <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : staff.length}
            </p>
            <p className="mt-1 text-sm text-green-600">{activeStaff} activos</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="pt-6">
            <p className="text-sm text-surface-500">Negocio activo</p>
            <p className="mt-2 text-lg font-semibold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : selectedBusiness?.name ?? 'Sin negocios'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineUsers className="h-5 w-5" />
              Staff activo del día
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-surface-500">Cargando...</p>
            ) : staffWorkingToday.length === 0 ? (
              <p className="text-sm text-surface-500">
                Ningún profesional tiene horario asignado para hoy.
              </p>
            ) : (
              <div className="space-y-3">
                {staffWorkingToday.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 dark:border-surface-800"
                  >
                    <div
                      className="h-2 w-8 shrink-0 rounded-full"
                      style={{ backgroundColor: person.color || '#8b5cf6' }}
                    />
                    <Avatar name={person.full_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-surface-900 dark:text-surface-50">
                        {person.full_name}
                      </p>
                      <p className="truncate text-xs text-surface-500">{person.title ?? 'Sin título'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <div
                    key={business.id}
                    className="rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                  >
                    <p className="font-medium text-surface-900 dark:text-surface-50">{business.name}</p>
                    <p className="text-sm text-surface-500">/{business.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineLink className="h-5 w-5" />
            Link para reservas
          </CardTitle>
          <p className="text-sm font-normal text-surface-500">
            Comparte este enlace para que tus clientes reserven turnos online.
          </p>
        </CardHeader>
        <CardContent>
          {selectedBusiness ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-sm text-surface-700 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
                {bookingUrl || '...'}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary-500 bg-primary-50 px-4 py-3 font-medium text-primary-600 transition-all hover:bg-primary-100 dark:border-primary-600 dark:bg-primary-950/50 dark:text-primary-400 dark:hover:bg-primary-900/50"
              >
                {copied ? (
                  <>
                    <HiOutlineCheck className="h-5 w-5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <HiOutlineClipboardDocument className="h-5 w-5" />
                    Copiar link
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-sm text-surface-500">Selecciona un negocio para ver el link.</p>
          )}
        </CardContent>
      </Card>

      {businesses.length === 0 && (
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
                href="/admin"
                className="inline-flex cursor-pointer items-center rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-all hover:bg-primary-700"
              >
                <HiOutlinePlus className="mr-2 h-5 w-5" />
                Ir a crear negocio
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
