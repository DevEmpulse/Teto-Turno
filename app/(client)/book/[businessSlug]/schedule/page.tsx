'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlineArrowLeft, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

// Generate available time slots (mock)
const generateTimeSlots = (date: Date): string[] => {
  const slots = [];
  const isToday = isSameDay(date, new Date());
  const currentHour = new Date().getHours();

  for (let hour = 9; hour < 19; hour++) {
    if (isToday && hour <= currentHour) continue;
    
    // Randomly mark some as unavailable
    if (Math.random() > 0.3) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    if (Math.random() > 0.3) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export default function SchedulePage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const staffId = searchParams.get('staff');

  const today = startOfToday();
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [weekStart, setWeekStart] = React.useState(0);

  // Generate dates for the week view
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekStart));

  // Generate time slots for selected date
  const timeSlots = React.useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const handleContinue = () => {
    if (selectedTime) {
      const dateTime = format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime;
      router.push(
        `/book/${params.businessSlug}/confirm?service=${serviceId}&staff=${staffId}&datetime=${dateTime}`
      );
    }
  };

  return (
    <div className="animate-in">
      {/* Progress indicator */}
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

      {/* Back button */}
      <Link
        href={`/book/${params.businessSlug}/staff?service=${serviceId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a profesionales
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Elige fecha y hora
        </h1>
        <p className="mt-1 text-surface-500">
          Selecciona el horario que mejor te convenga
        </p>
      </div>

      {/* Date selector */}
      <Card variant="elevated" className="mb-6">
        <CardContent>
          {/* Week navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekStart(Math.max(0, weekStart - 7))}
              disabled={weekStart === 0}
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-medium text-surface-900 dark:text-surface-50">
              {format(dates[0] ?? today, 'MMMM yyyy', { locale: es })}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekStart(weekStart + 7)}
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const dayName = format(date, 'EEE', { locale: es });
              const dayNumber = format(date, 'd');

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={cn(
                    'flex flex-col items-center rounded-xl p-3 transition-all',
                    isSelected
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs uppercase',
                      isSelected ? 'text-white/80' : 'text-surface-500'
                    )}
                  >
                    {dayName}
                  </span>
                  <span
                    className={cn(
                      'mt-1 text-lg font-semibold',
                      isSelected
                        ? 'text-white'
                        : 'text-surface-900 dark:text-surface-50'
                    )}
                  >
                    {dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time slots */}
      <div className="mb-6">
        <h2 className="mb-4 font-semibold text-surface-900 dark:text-surface-50">
          Horarios disponibles
        </h2>
        {timeSlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={cn(
                  'rounded-xl border-2 py-3 text-center font-medium transition-all',
                  selectedTime === time
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'border-surface-200 hover:border-primary-300 dark:border-surface-700'
                )}
              >
                {time}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-surface-500 py-8">
            No hay horarios disponibles para esta fecha
          </p>
        )}
      </div>

      {/* Continue button */}
      <Button
        onClick={handleContinue}
        disabled={!selectedTime}
        className="w-full"
        size="lg"
        variant="glow"
      >
        Continuar
      </Button>
    </div>
  );
}

