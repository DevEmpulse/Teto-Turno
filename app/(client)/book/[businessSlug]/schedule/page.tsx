'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
};

type Staff = {
  id: string;
  full_name?: string;
};

type PublicBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  services: Service[];
  staff: Staff[];
};

type AvailabilitySlot = {
  slot_time?: string;
  slot_datetime?: string;
};

function toISOFromDateAndHHMM(date: Date, hhmm: string): string {
  const [hour, minute] = hhmm.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hour ?? 0, minute ?? 0, 0, 0);
  return result.toISOString();
}

export default function SchedulePage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');

  const [business, setBusiness] = React.useState<PublicBusinessResponse | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [slots, setSlots] = React.useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = React.useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedService = business?.services.find((service) => service.id === serviceId) ?? null;
  const effectiveStaffId = staffId === 'any' ? (business?.staff[0]?.id ?? null) : staffId;

  React.useEffect(() => {
    const loadBusiness = async () => {
      setIsLoadingBusiness(true);
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
        setIsLoadingBusiness(false);
      }
    };

    void loadBusiness();
  }, [businessSlug]);

  React.useEffect(() => {
    const loadAvailability = async () => {
      if (!effectiveStaffId || !selectedService) {
        setSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);

      try {
        const dateParam = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/availability?staffId=${effectiveStaffId}&date=${dateParam}&duration=${selectedService.duration_minutes}`,
          { cache: 'no-store' }
        );

        const result = (await response.json()) as AvailabilitySlot[] | { error?: string };

        if (!response.ok) {
          const errorMessage = Array.isArray(result)
            ? 'No se pudo cargar disponibilidad'
            : (result.error ?? 'No se pudo cargar disponibilidad');
          setError(errorMessage);
          setSlots([]);
          return;
        }

        const fetchedSlots = (result as AvailabilitySlot[])
          .map((slot) => {
            if (slot.slot_time) return slot.slot_time.slice(0, 5);
            if (slot.slot_datetime) return format(new Date(slot.slot_datetime), 'HH:mm');
            return '';
          })
          .filter(Boolean);

        setSlots(fetchedSlots);
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    void loadAvailability();
  }, [effectiveStaffId, selectedDate, selectedService]);

  const next7Days = Array.from({ length: 7 }, (_, index) => addDays(new Date(), index));

  const handleContinue = () => {
    if (!selectedSlot) return;

    const selectedDateISO = toISOFromDateAndHHMM(selectedDate, selectedSlot);
    router.push(
      `/book/${businessSlug}/confirm?serviceId=${serviceId ?? ''}&staffId=${effectiveStaffId ?? ''}&date=${encodeURIComponent(selectedDateISO)}`
    );
  };

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
          <div className="h-full w-3/4 rounded-full bg-linear-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link
        href={`/book/${businessSlug}/staff?serviceId=${serviceId ?? ''}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a profesionales
      </Link>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige fecha y hora
        </h1>
        <p className="mt-1 text-surface-500">
          {selectedService
            ? `${selectedService.name} · ${selectedService.duration_minutes} min`
            : 'Selecciona una fecha'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoadingBusiness ? (
        <p className="text-surface-500">Cargando agenda...</p>
      ) : (
        <>
          <Card variant="elevated" className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {next7Days.map((day) => {
                  const isSelected =
                    format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-left transition-all',
                        isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-surface-200 hover:border-primary-300 dark:border-surface-700'
                      )}
                    >
                      <p className="text-xs uppercase">{format(day, 'EEE', { locale: es })}</p>
                      <p className="text-sm font-semibold">
                        {format(day, 'd MMM', { locale: es })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {staffId === 'any' && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Se buscará disponibilidad con el primer profesional disponible del negocio.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {isLoadingSlots ? (
              <p className="col-span-full text-surface-500">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="col-span-full text-surface-500">
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm font-medium transition-all',
                    selectedSlot === slot
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-surface-200 hover:border-primary-300 dark:border-surface-700'
                  )}
                >
                  {slot}
                </button>
              ))
            )}
          </div>

          <Button
            className="mt-6 w-full"
            variant="glow"
            disabled={!selectedSlot}
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </>
      )}
    </div>
  );
}
