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

// --- TIPOS ---

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

type SlotItem = {
  label: string;
  iso: string;
  available: boolean;
};

// Este es el formato exacto que devuelve tu nueva función SQL
type BackendSlot = {
  time: string; // ISO String del inicio del turno
  available: boolean;
};

// --- COMPONENTE DE SELECCIÓN DE HORARIOS (Simplificado) ---

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
      // Si faltan datos, limpiamos y no hacemos nada
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

        // 1. Llamamos a la API (que a su vez llama a tu SQL corregido)
        const response = await fetch(
          `/api/availability?staffId=${staffId}&date=${dateParam}&duration=${serviceDuration}`,
          { cache: 'no-store' }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al cargar disponibilidad');
        }

        // 2. Mapeo Directo: Lo que viene del backend es la única verdad.
        // La SQL ya filtró los ocupados, los cancelados y los horarios de cierre.
        const backendSlots = (result as BackendSlot[]) || [];

        const uiSlots: SlotItem[] = backendSlots.map((item) => {
          const dateObj = new Date(item.time);
          return {
            label: format(dateObj, 'HH:mm'), // Ej: "09:00"
            iso: item.time, // Ej: "2026-02-17T09:00:00-03:00"
            available: item.available, // true
          };
        });

        setSlots(uiSlots);
      } catch (err: any) {
        console.error(err);
        setError('No se pudo cargar los horarios. Intenta de nuevo.');
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAvailability();
  }, [selectedDate, serviceDuration, staffId]); // Quitamos onSelectSlot de dep para evitar loops

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

  if (slots.length === 0) {
    return <p className="text-sm text-surface-500">No hay turnos disponibles para esta fecha.</p>;
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
                : 'cursor-not-allowed border-surface-200 bg-surface-100 text-surface-400 opacity-50', // Opacidad para los no disponibles
              isSelected &&
                slot.available &&
                'border-primary-600 bg-primary-600 text-white hover:border-primary-600'
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}

// --- PÁGINA PRINCIPAL (Sin cambios lógicos, solo integración) ---

export default function SchedulePage({ params }: { params: Promise<{ businessSlug: string }> }) {
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
        if (!response.ok) throw new Error('Error cargando negocio');
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
      {/* ... (Todo tu header, pasos y selección de día se mantienen igual) ... */}

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
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlotIso(null); // Reseteamos selección al cambiar día
                      }}
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

          {/* Renderizamos el Picker Simplificado */}
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
