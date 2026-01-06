'use client';

import * as React from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendarDays,
  HiOutlinePlus,
  HiOutlineListBullet,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { cn } from '@/lib/utils';

// View tabs
const viewTabs = [
  { id: 'week', label: 'Semana', icon: HiOutlineCalendarDays },
  { id: 'day', label: 'Día', icon: HiOutlineListBullet },
  { id: 'staff', label: 'Por Personal', icon: HiOutlineUserGroup },
];

// Mock appointments data
const mockAppointments = [
  {
    id: '1',
    client: 'Carlos Rodríguez',
    service: 'Corte + Barba',
    staff: 'Juan Pérez',
    staffColor: '#8b5cf6',
    date: new Date(),
    startTime: '09:00',
    endTime: '09:45',
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'María García',
    service: 'Coloración',
    staff: 'Ana López',
    staffColor: '#06b6d4',
    date: new Date(),
    startTime: '10:00',
    endTime: '11:30',
    status: 'confirmed',
  },
  {
    id: '3',
    client: 'Pedro Martínez',
    service: 'Corte Clásico',
    staff: 'Juan Pérez',
    staffColor: '#8b5cf6',
    date: new Date(),
    startTime: '11:00',
    endTime: '11:30',
    status: 'pending',
  },
  {
    id: '4',
    client: 'Laura Sánchez',
    service: 'Tratamiento Capilar',
    staff: 'Ana López',
    staffColor: '#06b6d4',
    date: addDays(new Date(), 1),
    startTime: '14:00',
    endTime: '14:45',
    status: 'confirmed',
  },
  {
    id: '5',
    client: 'Diego Fernández',
    service: 'Barba Completa',
    staff: 'Carlos Ruiz',
    staffColor: '#10b981',
    date: addDays(new Date(), 2),
    startTime: '16:00',
    endTime: '16:25',
    status: 'confirmed',
  },
];

const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 8;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const staffMembers = [
  { id: '1', name: 'Juan Pérez', color: '#8b5cf6' },
  { id: '2', name: 'Ana López', color: '#06b6d4' },
  { id: '3', name: 'Carlos Ruiz', color: '#10b981' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [view, setView] = React.useState<'week' | 'day' | 'staff'>('week');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigatePrev = () => {
    setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1));
  };

  const navigateNext = () => {
    setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForDayAndTime = (day: Date, time: string) => {
    return mockAppointments.filter(
      (apt) => isSameDay(apt.date, day) && apt.startTime === time
    );
  };

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Calendario
          </h1>
          <p className="mt-1 text-surface-500">
            Gestiona las citas de tu equipo
          </p>
        </div>
        <Button variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
          Nueva Cita
        </Button>
      </div>

      {/* Calendar controls */}
      <Card variant="elevated">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={navigatePrev}>
                <HiOutlineChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={navigateNext}>
                <HiOutlineChevronRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <h2 className="ml-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </h2>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-surface-200 p-1 dark:border-surface-700">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setView(tab.id as 'week' | 'day' | 'staff')}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      view === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Quick link to appointments list */}
              <Link
                href="/admin/appointments"
                className="flex items-center gap-2 rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
              >
                <HiOutlineListBullet className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Lista</span>
              </Link>
            </div>
          </div>

          {/* Staff filter */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-surface-500">Profesionales:</span>
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center gap-2 rounded-full border border-surface-200 px-3 py-1.5 dark:border-surface-700"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: staff.color }}
                />
                <span className="text-sm font-medium">{staff.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar grid */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row with days */}
            <div className="grid grid-cols-8 border-b border-surface-200 dark:border-surface-800">
              <div className="p-4 text-center">
                <HiOutlineCalendarDays className="mx-auto h-5 w-5 text-surface-400" />
              </div>
              {(view === 'week' ? weekDays : [currentDate]).map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'border-l border-surface-200 p-4 text-center dark:border-surface-800',
                    isSameDay(day, new Date()) &&
                      'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <p className="text-xs font-medium uppercase text-surface-500">
                    {format(day, 'EEE', { locale: es })}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-2xl font-bold',
                      isSameDay(day, new Date())
                        ? 'text-primary-600'
                        : 'text-surface-900 dark:text-surface-50'
                    )}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="max-h-[600px] overflow-y-auto">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="grid grid-cols-8 border-b border-surface-100 dark:border-surface-800/50"
                >
                  <div className="p-2 text-right text-sm text-surface-400">
                    {time}
                  </div>
                  {(view === 'week' ? weekDays : [currentDate]).map((day) => {
                    const appointments = getAppointmentsForDayAndTime(day, time);
                    return (
                      <div
                        key={day.toISOString()}
                        className="relative min-h-[60px] border-l border-surface-100 p-1 dark:border-surface-800/50"
                      >
                        {appointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="mb-1 cursor-pointer rounded-lg p-2 text-xs text-white transition-transform hover:scale-[1.02]"
                            style={{ backgroundColor: apt.staffColor }}
                          >
                            <p className="font-medium">{apt.client}</p>
                            <p className="opacity-80">{apt.service}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Today's summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximas citas de hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAppointments
                .filter((apt) => isSameDay(apt.date, new Date()))
                .map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-900"
                  >
                    <div
                      className="h-12 w-1 rounded-full"
                      style={{ backgroundColor: apt.staffColor }}
                    />
                    <Avatar name={apt.client} />
                    <div className="flex-1">
                      <p className="font-medium text-surface-900 dark:text-surface-50">
                        {apt.client}
                      </p>
                      <p className="text-sm text-surface-500">{apt.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-surface-900 dark:text-surface-50">
                        {apt.startTime} - {apt.endTime}
                      </p>
                      <p className="text-sm text-surface-500">{apt.staff}</p>
                    </div>
                    <Badge
                      variant={apt.status === 'confirmed' ? 'success' : 'warning'}
                    >
                      {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Resumen del día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">
                  Total citas
                </span>
                <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                  {mockAppointments.filter((apt) => isSameDay(apt.date, new Date())).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">
                  Confirmadas
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {mockAppointments.filter(
                    (apt) =>
                      isSameDay(apt.date, new Date()) && apt.status === 'confirmed'
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">
                  Pendientes
                </span>
                <span className="text-2xl font-bold text-yellow-600">
                  {mockAppointments.filter(
                    (apt) =>
                      isSameDay(apt.date, new Date()) && apt.status === 'pending'
                  ).length}
                </span>
              </div>
              <hr className="border-surface-200 dark:border-surface-700" />
              <div className="flex items-center justify-between">
                <span className="text-surface-600 dark:text-surface-400">
                  Ingresos estimados
                </span>
                <span className="text-xl font-bold text-primary-600">
                  $12,500
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

