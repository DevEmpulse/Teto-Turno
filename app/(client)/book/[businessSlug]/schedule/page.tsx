'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDays, addMinutes, format, setHours, setMinutes } from 'date-fns';
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

type BusyRange = {
  start: Date;
  end: Date;
};

type SlotItem = {
  label: string;
  iso: string;
  startsAt: Date;
  endsAt: Date;
  available: boolean;
};

type AvailabilitySlot = {
  slot_time?: string;
  slot_datetime?: string;
  start_at?: string;
  end_at?: string;
  scheduled_at?: string;
  duration_minutes?: number;
};

type GenerateAvailableSlotsInput = {
  selectedDate: Date;
  serviceDuration: number;
  occupiedRanges: BusyRange[];
  openingTime?: string;
  closingTime?: string;
  intervalMinutes?: number;
};

function parseHHMM(baseDate: Date, value: string): Date {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  const safeHours = typeof hours === 'number' && Number.isFinite(hours) ? hours : 0;
  const safeMinutes = typeof minutes === 'number' && Number.isFinite(minutes) ? minutes : 0;
  const withHours = setHours(baseDate, safeHours);
  return setMinutes(withHours, safeMinutes);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export function generateAvailableSlots({
  selectedDate,
  serviceDuration,
  occupiedRanges,
  openingTime = '09:00',
  closingTime = '18:00',
  intervalMinutes = 30,
}: GenerateAvailableSlotsInput): SlotItem[] {
  if (!serviceDuration || serviceDuration <= 0) return [];

  const dayStart = parseHHMM(selectedDate, openingTime);
  const dayEnd = parseHHMM(selectedDate, closingTime);
  const slots: SlotItem[] = [];

  for (
    let candidateStart = new Date(dayStart);
    addMinutes(candidateStart, serviceDuration) <= dayEnd;
    candidateStart = addMinutes(candidateStart, intervalMinutes)
  ) {
    const candidateEnd = addMinutes(candidateStart, serviceDuration);
    const hasCollision = occupiedRanges.some((busy) =>
      overlaps(candidateStart, candidateEnd, busy.start, busy.end)
    );

    slots.push({
      label: format(candidateStart, 'HH:mm'),
      iso: candidateStart.toISOString(),
      startsAt: new Date(candidateStart),
      endsAt: candidateEnd,
      available: !hasCollision,
    });
  }

  return slots;
}

type TimeSlotPickerProps = {
  selectedDate: Date;
  serviceDuration: number;
  staffId: string | null;
  selectedSlotIso: string | null;
  onSelectSlot: (slotIso: string | null) => void;
};

function TimeSlotPicker({
  selectedDate,
  serviceDuration,
  staffId,
  selectedSlotIso,
  onSelectSlot,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = React.useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadAvailability = async () => {
      if (!staffId || !serviceDuration) {
        setSlots([]);
        onSelectSlot(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      onSelectSlot(null);

      try {
        const dateParam = format(selectedDate, 'yyyy-MM-dd');

        const response = await fetch(
          `/api/availability?staffId=${staffId}&date=${dateParam}&duration=${serviceDuration}`,
          { cache: 'no-store' }
        );

        const result = (await response.json()) as AvailabilitySlot[] | { error?: string };

        if (!response.ok) {
          const message = Array.isArray(result)
            ? 'No se pudo cargar disponibilidad'
            : (result.error ?? 'No se pudo cargar disponibilidad');
          setError(message);
          setSlots([]);
          return;
        }

        const rows = Array.isArray(result) ? result : [];

        const occupiedRanges: BusyRange[] = rows
          .map((item) => {
            if (item.start_at && item.end_at) {
              const start = new Date(item.start_at);
              const end = new Date(item.end_at);
              if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
                return { start, end };
              }
            }

            if (item.scheduled_at && item.duration_minutes) {
              const start = new Date(item.scheduled_at);
              if (Number.isNaN(start.getTime())) return null;
              return { start, end: addMinutes(start, item.duration_minutes) };
            }

            return null;
          })
          .filter((range): range is BusyRange => range !== null);

        const backendAvailableSet = new Set(
          rows
            .map((item) => {
              if (item.slot_time) return item.slot_time.slice(0, 5);
              if (item.slot_datetime) {
                const date = new Date(item.slot_datetime);
                if (!Number.isNaN(date.getTime())) return format(date, 'HH:mm');
              }
              return null;
            })
            .filter((time): time is string => Boolean(time))
        );

        const computedSlots = generateAvailableSlots({
          selectedDate,
          serviceDuration,
          occupiedRanges,
          openingTime: '09:00',
          closingTime: '18:00',
          intervalMinutes: 30,
        });

        const normalizedSlots =
          backendAvailableSet.size > 0
            ? computedSlots.map((slot) => ({
                ...slot,
                available: slot.available && backendAvailableSet.has(slot.label),
              }))
            : computedSlots;

        setSlots(normalizedSlots);
      } catch {
        setError('Error de conexión. Intenta nuevamente.');
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAvailability();
  }, [onSelectSlot, selectedDate, serviceDuration, staffId]);

  const availableCount = slots.filter((slot) => slot.available).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`slot-skeleton-${index}`}
            className="h-10 animate-pulse rounded-xl border border-surface-200 bg-surface-100 dark:border-surface-700 dark:bg-surface-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (slots.length === 0 || availableCount === 0) {
    return (
      <p className="text-sm text-surface-500">No hay turnos disponibles para esta fecha.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selectedSlotIso === slot.iso;

        return (
          <button
            key={slot.iso}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelectSlot(slot.iso)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm font-medium transition-all',
              slot.available
                ? 'cursor-pointer border-surface-200 hover:border-primary-300 dark:border-surface-700'
                : 'cursor-not-allowed border-surface-200 bg-surface-100 text-surface-400 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-600',
              isSelected && slot.available && 'border-primary-600 bg-primary-600 text-white hover:border-primary-600'
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
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
  const [selectedSlotIso, setSelectedSlotIso] = React.useState<string | null>(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = React.useState(true);
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

  const next7Days = Array.from({ length: 7 }, (_, index) => addDays(new Date(), index));

  const handleContinue = () => {
    if (!selectedSlotIso) return;

    router.push(
      `/book/${businessSlug}/confirm?serviceId=${serviceId ?? ''}&staffId=${effectiveStaffId ?? ''}&date=${encodeURIComponent(selectedSlotIso)}`
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
                        'cursor-pointer rounded-xl border px-3 py-2 text-left transition-all',
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

          <TimeSlotPicker
            selectedDate={selectedDate}
            serviceDuration={selectedService?.duration_minutes ?? 0}
            staffId={effectiveStaffId}
            selectedSlotIso={selectedSlotIso}
            onSelectSlot={setSelectedSlotIso}
          />

          <Button
            className="mt-6 w-full"
            variant="glow"
            disabled={!selectedSlotIso}
            onClick={handleContinue}
          >
            Continuar
          </Button>
        </>
      )}
    </div>
  );
}
