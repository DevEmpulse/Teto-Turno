'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Avatar } from '@/presentation/components/ui/avatar';
import { Badge } from '@/presentation/components/ui/badge';

type Service = { id: string; name: string };
type Staff = {
  id: string;
  full_name?: string;
  title: string | null;
  email?: string;
  user_id?: string;
};

type PublicBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  services: Service[];
  staff: Staff[];
};

export default function StaffSelectionPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  const [business, setBusiness] = React.useState<PublicBusinessResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBusiness = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/public/business/${businessSlug}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          setError(result.error ?? 'No se pudo cargar el negocio');
          return;
        }

        const result = (await response.json()) as PublicBusinessResponse;
        setBusiness(result);
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBusiness();
  }, [businessSlug]);

  const selectedService = business?.services.find((service) => service.id === serviceId) ?? null;
  const staffList = business?.staff ?? [];

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">1. Servicio</span>
          <span className="font-medium text-primary-600">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="text-surface-400">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-2/4 rounded-full bg-linear-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link
        href={`/book/${businessSlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a servicios
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige un profesional
        </h1>
        <p className="mt-1 text-surface-500">
          Servicio: {selectedService?.name ?? 'No seleccionado'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card
        variant="interactive"
        className="mb-4"
        onClick={() =>
          router.push(
            `/book/${businessSlug}/schedule?serviceId=${serviceId ?? ''}&staffId=any`
          )
        }
      >
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-surface-900 dark:text-surface-50">
              Cualquier profesional
            </p>
            <p className="text-sm text-surface-500">Te asignaremos el primero disponible</p>
          </div>
          <Badge variant="secondary">Flexible</Badge>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-surface-500">Cargando profesionales...</p>
      ) : (
        <div className="space-y-4">
          {staffList.map((person) => (
            <Card
              key={person.id}
              variant="interactive"
              onClick={() =>
                router.push(
                  `/book/${businessSlug}/schedule?serviceId=${serviceId ?? ''}&staffId=${person.id}`
                )
              }
            >
              <CardContent className="flex items-center gap-4">
                <Avatar name={person.full_name ?? 'Profesional'} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                    {person.full_name ?? 'Profesional'}
                  </h3>
                  <p className="text-sm text-primary-600">{person.title ?? 'Sin título'}</p>
                  <p className="mt-1 text-sm text-surface-500 line-clamp-1">
                    {person.email ?? 'Sin email'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && staffList.length === 0 && (
        <div className="rounded-xl border border-surface-200 bg-white p-6 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
          No hay profesionales disponibles para este negocio.
        </div>
      )}
    </div>
  );
}
