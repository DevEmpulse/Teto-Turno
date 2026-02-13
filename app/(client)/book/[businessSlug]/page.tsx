'use client';

import * as React from 'react';
import Link from 'next/link';
import { HiOutlineCalendarDays, HiOutlinePlusCircle } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type PublicBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  services?: unknown[];
};

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  status: string;
  duration_minutes: number;
  price: number;
  services: { name: string | null } | null;
  staff: { id: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
  no_show: 'No asistió',
};

export default function BookLandingPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = React.use(params);
  const [business, setBusiness] = React.useState<PublicBusinessResponse | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = React.useState(true);
  const [errorBusiness, setErrorBusiness] = React.useState<string | null>(null);

  const [email, setEmail] = React.useState('');
  const [appointments, setAppointments] = React.useState<AppointmentRow[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = React.useState(false);
  const [errorAppointments, setErrorAppointments] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    const loadBusiness = async () => {
      setIsLoadingBusiness(true);
      setErrorBusiness(null);
      try {
        const res = await fetch(`/api/public/business/${businessSlug}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          setErrorBusiness(json.error ?? 'No se pudo cargar el negocio');
          return;
        }
        const data = (await res.json()) as PublicBusinessResponse;
        setBusiness(data);
      } catch {
        setErrorBusiness('Error de conexión.');
      } finally {
        setIsLoadingBusiness(false);
      }
    };
    void loadBusiness();
  }, [businessSlug]);

  const handleSearchReservations = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setSearched(true);
    setIsLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      const res = await fetch(
        `/api/public/appointments?slug=${encodeURIComponent(businessSlug)}&email=${encodeURIComponent(value)}`,
        { cache: 'no-store' }
      );
      const json = (await res.json()) as { appointments?: AppointmentRow[]; error?: string };
      if (!res.ok) {
        setErrorAppointments(json.error ?? 'Error al buscar');
        setAppointments([]);
        return;
      }
      setAppointments(json.appointments ?? []);
    } catch {
      setErrorAppointments('Error de conexión.');
      setAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          {isLoadingBusiness ? 'Cargando...' : business?.name ?? 'Reservar cita'}
        </h1>
        <p className="mt-1 text-surface-500">
          Elegí una opción para continuar
        </p>
      </div>

      {errorBusiness && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
          {errorBusiness}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card variant="elevated" className="flex flex-col">
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <HiOutlineCalendarDays className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
              Mis reservas
            </h2>
            <p className="mt-1 flex-1 text-sm text-surface-500">
              Ingresá tu email para ver las reservas que hiciste en este negocio.
            </p>
            <form onSubmit={handleSearchReservations} className="mt-4 space-y-3">
              <div>
                <label htmlFor="email-reservas" className="sr-only">
                  Email
                </label>
                <Input
                  id="email-reservas"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" variant="default" className="w-full">
                Ver mis reservas
              </Button>
            </form>

            {searched && (
              <div className="mt-4 border-t border-surface-200 pt-4 dark:border-surface-800">
                {isLoadingAppointments ? (
                  <p className="text-sm text-surface-500">Buscando...</p>
                ) : errorAppointments ? (
                  <p className="text-sm text-red-600">{errorAppointments}</p>
                ) : appointments.length === 0 ? (
                  <p className="text-sm text-surface-500">
                    No encontramos reservas con ese email.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {appointments.map((apt) => (
                      <li
                        key={apt.id}
                        className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm dark:border-surface-800 dark:bg-surface-900"
                      >
                        <div className="font-medium text-surface-900 dark:text-surface-50">
                          {(apt.services as { name: string | null } | null)?.name ?? 'Servicio'}
                        </div>
                        <div className="mt-1 text-surface-500">
                          {format(parseISO(apt.scheduled_at), "EEEE d 'de' MMMM, HH:mm", {
                            locale: es,
                          })}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span>
                            {STATUS_LABELS[apt.status] ?? apt.status}
                          </span>
                          <span className="font-medium text-primary-600">
                            ${(apt.price / 100).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Link href={`/book/${businessSlug}/service`} className="block cursor-pointer">
          <Card variant="interactive" className="h-full">
            <CardContent className="flex flex-col p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/30">
                <HiOutlinePlusCircle className="h-6 w-6 text-accent-600" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
                Hacer una reserva
              </h2>
              <p className="mt-1 flex-1 text-sm text-surface-500">
                Elegí servicio, profesional y horario para agendar una nueva cita.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary-600">
                Continuar
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
