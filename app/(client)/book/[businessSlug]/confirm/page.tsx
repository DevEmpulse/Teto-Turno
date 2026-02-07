'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';

type Business = { id: string; slug: string };
type Service = { id: string; name: string; duration_minutes: number; price: number };
type Staff = { id: string; full_name: string; title: string | null };

export default function ConfirmPage({ params }: { params: { businessSlug: string } }) {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const staffId = searchParams.get('staff');

  const [service, setService] = React.useState<Service | null>(null);
  const [staff, setStaff] = React.useState<Staff | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

        const businessId = (businessesJson.businesses ?? []).find((b) => b.slug === params.businessSlug)?.id;
        if (!businessId) {
          setError('Negocio no encontrado');
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
          setIsLoading(false);
          return;
        }

        if (!staffRes.ok) {
          setError(staffJson.error ?? 'No se pudo cargar el staff');
          setIsLoading(false);
          return;
        }

        setService((servicesJson.services ?? []).find((item) => item.id === serviceId) ?? null);
        setStaff((staffJson.staff ?? []).find((item) => item.id === staffId) ?? null);
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [params.businessSlug, serviceId, staffId]);

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="font-medium text-primary-600">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link
        href={`/book/${params.businessSlug}/schedule?service=${serviceId}&staff=${staffId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a horarios
      </Link>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card variant="elevated">
        <CardContent className="py-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Confirmación</h1>
          <p className="mt-2 text-surface-500">Esta vista usa solo datos reales de `/api/services` y `/api/staff`.</p>

          {isLoading ? (
            <p className="mt-6 text-surface-500">Cargando detalles...</p>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-surface-700 dark:text-surface-200">
                <strong>Servicio:</strong> {service?.name ?? 'No seleccionado'}
              </p>
              <p className="text-surface-700 dark:text-surface-200">
                <strong>Duración:</strong> {service?.duration_minutes ?? 0} min
              </p>
              <p className="text-surface-700 dark:text-surface-200">
                <strong>Precio:</strong> ${(service?.price ? service.price / 100 : 0).toLocaleString()}
              </p>
              <p className="text-surface-700 dark:text-surface-200">
                <strong>Profesional:</strong> {staff?.full_name ?? 'No seleccionado'}
              </p>
              <p className="text-surface-700 dark:text-surface-200">
                <strong>Título:</strong> {staff?.title ?? 'Sin título'}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No hay endpoint de creación de citas en `/api` todavía. Por eso no se confirma la reserva desde esta pantalla.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
