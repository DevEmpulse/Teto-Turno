'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Avatar } from '@/presentation/components/ui/avatar';

type Business = { id: string; slug: string };
type Staff = {
  id: string;
  full_name: string;
  title: string | null;
  email: string;
};

export default function StaffSelectionPage({ params }: { params: { businessSlug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const [staff, setStaff] = React.useState<Staff[]>([]);
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
          setStaff([]);
          setIsLoading(false);
          return;
        }

        const staffRes = await fetch(`/api/staff?businessId=${businessId}`, { cache: 'no-store' });
        const staffJson = (await staffRes.json()) as { staff?: Staff[]; error?: string };
        if (!staffRes.ok) {
          setError(staffJson.error ?? 'No se pudo cargar el staff');
          setStaff([]);
          setIsLoading(false);
          return;
        }

        setStaff(staffJson.staff ?? []);
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [params.businessSlug]);

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
          <div className="h-full w-2/4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link href={`/book/${params.businessSlug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700">
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a servicios
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Elige un profesional</h1>
        <p className="mt-1 text-surface-500">Datos consumidos desde `/api/staff`.</p>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <p className="text-surface-500">Cargando profesionales...</p>
      ) : (
        <div className="space-y-4">
          {staff.map((person) => (
            <Card
              key={person.id}
              variant="interactive"
              onClick={() => router.push(`/book/${params.businessSlug}/schedule?service=${serviceId}&staff=${person.id}`)}
            >
              <CardContent className="flex items-center gap-4">
                <Avatar name={person.full_name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 dark:text-surface-50">{person.full_name}</h3>
                  <p className="text-sm text-primary-600">{person.title ?? 'Sin título'}</p>
                  <p className="mt-1 text-sm text-surface-500 line-clamp-1">{person.email}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && staff.length === 0 && (
        <div className="rounded-xl border border-surface-200 bg-white p-6 text-center text-surface-500 dark:border-surface-800 dark:bg-surface-900">
          No hay profesionales disponibles para este negocio.
        </div>
      )}
    </div>
  );
}
