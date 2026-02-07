'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';

export default function SchedulePage({ params }: { params: { businessSlug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const staffId = searchParams.get('staff');

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="font-medium text-primary-600">3. Horario</span>
          <span className="text-surface-400">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link
        href={`/book/${params.businessSlug}/staff?service=${serviceId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a profesionales
      </Link>

      <Card variant="elevated">
        <CardContent className="py-10 text-center">
          <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-50">Horarios</h1>
          <p className="mt-2 text-surface-500">No hay endpoint de disponibilidad implementado en `/api`.</p>
          <p className="mt-1 text-sm text-surface-500">Cuando exista (ej: `/api/slots`), esta pantalla podrá listar horarios reales.</p>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => router.push(`/book/${params.businessSlug}/confirm?service=${serviceId}&staff=${staffId}`)}
          >
            Continuar sin horario (demo)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
