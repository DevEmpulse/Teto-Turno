'use client';

import * as React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';

type Business = {
  id: string;
  name: string;
};

type AppointmentApi = {
  id: string;
  scheduled_at: string;
  status: string;
  customers?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  services?: {
    name?: string | null;
    duration_minutes?: number | null;
    price?: number | null;
  } | null;
  staff?: {
    full_name?: string | null;
  } | null;
};

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
  if (status === 'confirmed' || status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled' || status === 'no_show') return 'danger';
  if (status === 'in_progress') return 'info';
  return 'secondary';
}

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

function getClientName(appointment: AppointmentApi): string {
  return appointment.customers?.full_name?.trim() || 'Cliente Invitado';
}

function getServiceName(appointment: AppointmentApi): string {
  return appointment.services?.name?.trim() || 'Servicio no definido';
}

function getStaffName(appointment: AppointmentApi): string {
  return appointment.staff?.full_name?.trim() || 'Profesional no asignado';
}

function getClientContact(appointment: AppointmentApi): string | null {
  const email = appointment.customers?.email?.trim();
  const phone = appointment.customers?.phone?.trim();

  if (email && phone) return `${email} · ${phone}`;
  if (email) return email;
  if (phone) return phone;
  return null;
}

function formatFriendlyDate(isoDate: string): string {
  const parsedDate = parseISO(isoDate);
  if (isToday(parsedDate)) {
    return `Hoy a las ${format(parsedDate, 'HH:mm')}`;
  }
  return format(parsedDate, "EEE d MMM 'a las' HH:mm", { locale: es });
}

export default function AppointmentsPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [appointments, setAppointments] = React.useState<AppointmentApi[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/businesses', { cache: 'no-store' });
        const result = (await response.json()) as { businesses?: Business[]; error?: string };

        if (!response.ok) {
          setErrorMessage(result.error ?? 'No se pudieron cargar los negocios');
          return;
        }

        const fetchedBusinesses = result.businesses ?? [];
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
    const loadAppointments = async () => {
      if (!selectedBusinessId) {
        setAppointments([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/appointments?businessId=${selectedBusinessId}`, {
          cache: 'no-store',
        });
        const result = (await response.json()) as
          | { appointments?: AppointmentApi[]; error?: string }
          | AppointmentApi[];

        if (!response.ok) {
          const error = Array.isArray(result) ? undefined : result.error;
          setErrorMessage(error ?? 'No se pudieron cargar las citas');
          setAppointments([]);
          return;
        }

        const fetchedAppointments = Array.isArray(result) ? result : result.appointments ?? [];
        const sortedAppointments = [...fetchedAppointments].sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );

        setAppointments(sortedAppointments);
      } catch {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
  }, [selectedBusinessId]);

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Citas</h1>
        <p className="mt-1 text-surface-500">Próximas citas conectadas al backend real.</p>
      </div>

      <div className="max-w-sm">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-500">
          Negocio
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
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

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-surface-500">Cargando citas...</p>
          ) : appointments.length === 0 ? (
            <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-8 text-center text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
              Aún no tienes citas registradas para este negocio.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const date = parseISO(appointment.scheduled_at);
                const clientName = getClientName(appointment);
                const serviceName = getServiceName(appointment);
                const staffName = getStaffName(appointment);
                const clientContact = getClientContact(appointment);

                return (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm transition-all hover:shadow-md dark:border-surface-800 dark:bg-surface-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-surface-900 dark:text-surface-50">
                        {clientName}
                      </p>
                      {clientContact && (
                        <p
                          title={clientContact}
                          className="truncate text-xs text-surface-500"
                        >
                          {clientContact}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-surface-700 dark:text-surface-200">
                        {formatFriendlyDate(appointment.scheduled_at)}
                      </p>
                      <p className="mt-1 truncate text-sm text-surface-500 dark:text-surface-400">
                        {serviceName} · {staffName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-surface-900 dark:text-surface-50">
                        {format(date, 'HH:mm')} hs
                      </span>
                      <Badge variant={getStatusBadgeVariant(appointment.status)} dot>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
