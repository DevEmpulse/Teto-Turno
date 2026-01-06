'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineStar } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Avatar } from '@/presentation/components/ui/avatar';
import { Badge } from '@/presentation/components/ui/badge';

// Mock staff data
const staffMembers = [
  {
    id: '1',
    name: 'Juan Pérez',
    title: 'Senior Barber',
    bio: '10 años de experiencia en cortes clásicos y modernos',
    rating: 4.9,
    reviews: 127,
    avatar: null,
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    title: 'Barber & Stylist',
    bio: 'Especialista en degradados y diseños personalizados',
    rating: 4.8,
    reviews: 89,
    avatar: null,
  },
  {
    id: '3',
    name: 'Ana López',
    title: 'Color Specialist',
    bio: 'Experta en coloración y tratamientos capilares',
    rating: 4.9,
    reviews: 156,
    avatar: null,
  },
];

export default function StaffSelectionPage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');

  const handleStaffSelect = (staffId: string) => {
    router.push(
      `/book/${params.businessSlug}/schedule?service=${serviceId}&staff=${staffId}`
    );
  };

  const handleAnyStaff = () => {
    router.push(
      `/book/${params.businessSlug}/schedule?service=${serviceId}&staff=any`
    );
  };

  return (
    <div className="animate-in">
      {/* Progress indicator */}
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

      {/* Back button */}
      <Link
        href={`/book/${params.businessSlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a servicios
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige un profesional
        </h1>
        <p className="mt-1 text-surface-500">
          Selecciona quién te atenderá o deja que asignemos al más disponible
        </p>
      </div>

      {/* Any professional option */}
      <Card
        variant="interactive"
        className="mb-4"
        onClick={handleAnyStaff}
      >
        <CardContent className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-accent-100 text-2xl dark:from-primary-900/30 dark:to-accent-900/30">
            ✨
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
              Sin preferencia
            </h3>
            <p className="text-sm text-surface-500">
              Te asignaremos al profesional más disponible
            </p>
          </div>
          <Badge variant="secondary">Recomendado</Badge>
        </CardContent>
      </Card>

      {/* Staff list */}
      <div className="space-y-4">
        {staffMembers.map((staff) => (
          <Card
            key={staff.id}
            variant="interactive"
            onClick={() => handleStaffSelect(staff.id)}
          >
            <CardContent className="flex items-center gap-4">
              <Avatar name={staff.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                  {staff.name}
                </h3>
                <p className="text-sm text-primary-600">{staff.title}</p>
                <p className="mt-1 text-sm text-surface-500 line-clamp-1">
                  {staff.bio}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <HiOutlineStar className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{staff.rating}</span>
                </div>
                <p className="text-xs text-surface-500">{staff.reviews} reseñas</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

