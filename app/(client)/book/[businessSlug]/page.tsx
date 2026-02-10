'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineClock } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
};

type PublicBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  services: Service[];
};

export default function ServiceSelectionPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = React.use(params);
  const router = useRouter();
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

  const services = business?.services ?? [];

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary-600">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="text-surface-400">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-1/4 rounded-full bg-linear-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige un servicio
        </h1>
        <p className="mt-1 text-surface-500">{business?.name ?? 'Cargando negocio...'}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-surface-500">Cargando servicios...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.id}
              variant="interactive"
              padding="none"
              className="overflow-hidden"
              onClick={() =>
                router.push(`/book/${businessSlug}/staff?serviceId=${service.id}`)
              }
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                  {service.description ?? 'Sin descripción'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-surface-500">
                    <HiOutlineClock className="h-4 w-4" />
                    {service.duration_minutes} min
                  </span>
                  <span className="font-semibold text-primary-600">
                    ${(service.price / 100).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && services.length === 0 && (
        <div className="rounded-xl border border-surface-200 bg-white p-6 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
          No hay servicios disponibles para este negocio.
        </div>
      )}
    </div>
  );
}
