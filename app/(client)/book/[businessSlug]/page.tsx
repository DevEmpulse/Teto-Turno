'use client';

import { useRouter } from 'next/navigation';
import { HiOutlineClock } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';

// Mock services data
const services = [
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con tijera y máquina',
    duration: 30,
    price: 2500,
    category: 'haircut',
    image: null,
  },
  {
    id: '2',
    name: 'Corte + Barba',
    description: 'Combo de corte de pelo y arreglo de barba',
    duration: 45,
    price: 3500,
    category: 'combo',
    image: null,
  },
  {
    id: '3',
    name: 'Barba Completa',
    description: 'Perfilado, afeitado y tratamiento con toalla caliente',
    duration: 25,
    price: 1800,
    category: 'beard',
    image: null,
  },
  {
    id: '4',
    name: 'Corte Degradado',
    description: 'Fade moderno con diseño personalizado',
    duration: 40,
    price: 3000,
    category: 'haircut',
    image: null,
  },
  {
    id: '5',
    name: 'Coloración',
    description: 'Tinte completo o mechas',
    duration: 90,
    price: 5500,
    category: 'coloring',
    image: null,
  },
  {
    id: '6',
    name: 'Tratamiento Capilar',
    description: 'Hidratación profunda y masaje',
    duration: 45,
    price: 2800,
    category: 'treatment',
    image: null,
  },
];

export default function ServiceSelectionPage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const router = useRouter();

  const handleServiceSelect = (serviceId: string) => {
    router.push(`/book/${params.businessSlug}/staff?service=${serviceId}`);
  };

  return (
    <div className="animate-in">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary-600">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="text-surface-400">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige un servicio
        </h1>
        <p className="mt-1 text-surface-500">
          Selecciona el servicio que deseas reservar
        </p>
      </div>

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            variant="interactive"
            padding="none"
            className="overflow-hidden"
            onClick={() => handleServiceSelect(service.id)}
          >
            <CardContent className="p-0">
              {/* Service image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                <div className="flex h-full items-center justify-center">
                  <span className="text-4xl">
                    {service.category === 'haircut' && '💇‍♂️'}
                    {service.category === 'beard' && '🧔'}
                    {service.category === 'combo' && '✨'}
                    {service.category === 'coloring' && '🎨'}
                    {service.category === 'treatment' && '💆‍♂️'}
                  </span>
                </div>
              </div>

              {/* Service info */}
              <div className="p-4">
                <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1">
                      <HiOutlineClock className="h-4 w-4" />
                      {service.duration} min
                    </span>
                  </div>
                  <span className="font-semibold text-primary-600">
                    ${service.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

