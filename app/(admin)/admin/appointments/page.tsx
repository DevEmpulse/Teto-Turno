'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineEllipsisVertical,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineArchiveBox,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/lib/utils';

// Navigation tabs
const tabs = [
  { id: 'today', label: 'Hoy', icon: HiOutlineCalendarDays },
  { id: 'pending', label: 'Pendientes', icon: HiOutlineClock, badge: 2 },
  { id: 'upcoming', label: 'Próximas', icon: HiOutlineExclamationCircle },
  { id: 'history', label: 'Historial', icon: HiOutlineArchiveBox },
];

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface Appointment {
  id: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  staff: {
    name: string;
    color: string;
  };
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
}

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: '1',
    client: { name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+54 11 1234 5678' },
    service: { name: 'Corte + Barba', duration: 45, price: 3500 },
    staff: { name: 'Juan Pérez', color: '#8b5cf6' },
    date: new Date(),
    time: '09:00',
    status: 'confirmed',
  },
  {
    id: '2',
    client: { name: 'María García', email: 'maria@email.com', phone: '+54 11 2345 6789' },
    service: { name: 'Coloración', duration: 90, price: 5500 },
    staff: { name: 'Ana López', color: '#06b6d4' },
    date: new Date(),
    time: '10:00',
    status: 'pending',
  },
  {
    id: '3',
    client: { name: 'Pedro Martínez', email: 'pedro@email.com', phone: '+54 11 3456 7890' },
    service: { name: 'Corte Clásico', duration: 30, price: 2500 },
    staff: { name: 'Juan Pérez', color: '#8b5cf6' },
    date: new Date(),
    time: '11:00',
    status: 'completed',
  },
  {
    id: '4',
    client: { name: 'Laura Sánchez', email: 'laura@email.com', phone: '+54 11 4567 8901' },
    service: { name: 'Tratamiento Capilar', duration: 45, price: 2800 },
    staff: { name: 'Ana López', color: '#06b6d4' },
    date: new Date(),
    time: '14:00',
    status: 'cancelled',
  },
  {
    id: '5',
    client: { name: 'Diego Fernández', email: 'diego@email.com', phone: '+54 11 5678 9012' },
    service: { name: 'Barba Completa', duration: 25, price: 1800 },
    staff: { name: 'Carlos Ruiz', color: '#10b981' },
    date: new Date(),
    time: '16:00',
    status: 'no_show',
  },
];

const statusConfig: Record<
  AppointmentStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' }
> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  completed: { label: 'Completado', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
  no_show: { label: 'No asistió', variant: 'danger' },
};

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<AppointmentStatus | 'all'>('all');
  const [activeTab, setActiveTab] = React.useState('today');

  const filteredAppointments = mockAppointments.filter((apt) => {
    const matchesSearch =
      apt.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockAppointments.length,
    pending: mockAppointments.filter((a) => a.status === 'pending').length,
    confirmed: mockAppointments.filter((a) => a.status === 'confirmed').length,
    completed: mockAppointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Citas
          </h1>
          <p className="mt-1 text-surface-500">
            Gestiona todas las reservas de tu negocio
          </p>
        </div>
        <Button variant="glow" leftIcon={<HiOutlineCalendarDays className="h-5 w-5" />}>
          Nueva Cita
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.badge && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Hoy', value: stats.total, color: 'text-surface-900 dark:text-surface-50' },
          { label: 'Pendientes', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Confirmadas', value: stats.confirmed, color: 'text-green-600' },
          { label: 'Completadas', value: stats.completed, color: 'text-blue-600' },
        ].map((stat) => (
          <Card key={stat.label} variant="elevated">
            <CardContent className="py-4">
              <p className="text-sm text-surface-500">{stat.label}</p>
              <p className={cn('mt-1 text-3xl font-bold', stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<HiOutlineMagnifyingGlass className="h-5 w-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineFunnel className="h-5 w-5 text-surface-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus | 'all')}
                className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
                <option value="no_show">No asistió</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <Card variant="elevated" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50 text-left dark:border-surface-800 dark:bg-surface-900">
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Cliente</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Servicio</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Profesional</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Fecha/Hora</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Estado</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Precio</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-900/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={apt.client.name} size="sm" />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-surface-50">
                          {apt.client.name}
                        </p>
                        <p className="text-sm text-surface-500">{apt.client.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {apt.service.name}
                    </p>
                    <p className="text-sm text-surface-500">{apt.service.duration} min</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: apt.staff.color }}
                      />
                      <span className="text-surface-900 dark:text-surface-50">
                        {apt.staff.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {format(apt.date, 'd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-sm text-surface-500">{apt.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusConfig[apt.status].variant}>
                      {statusConfig[apt.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-surface-900 dark:text-surface-50">
                      ${apt.service.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {apt.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon-sm" className="text-green-600">
                            <HiOutlineCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-red-600">
                            <HiOutlineXMark className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon-sm">
                        <HiOutlineEllipsisVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="py-12 text-center">
            <HiOutlineCalendarDays className="mx-auto h-12 w-12 text-surface-300" />
            <p className="mt-4 text-surface-500">No se encontraron citas</p>
          </div>
        )}
      </Card>
    </div>
  );
}

