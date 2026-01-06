'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineScissors,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { cn } from '@/lib/utils';

// View tabs for staff
const staffTabs = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
  { id: 'on_leave', label: 'En Licencia' },
];

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  status: 'active' | 'inactive' | 'on_leave';
  color: string;
  avatar?: string;
  services: string[];
  workingDays: number[];
  workingHours: { start: string; end: string };
  stats: {
    appointmentsThisMonth: number;
    revenueThisMonth: number;
    rating: number;
    reviews: number;
  };
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@teto.app',
    phone: '+54 11 1234 5678',
    title: 'Senior Barber',
    status: 'active',
    color: '#8b5cf6',
    services: ['Corte Clásico', 'Corte + Barba', 'Barba Completa', 'Degradado'],
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '18:00' },
    stats: {
      appointmentsThisMonth: 45,
      revenueThisMonth: 125000,
      rating: 4.9,
      reviews: 127,
    },
  },
  {
    id: '2',
    name: 'Ana López',
    email: 'ana@teto.app',
    phone: '+54 11 2345 6789',
    title: 'Color Specialist',
    status: 'active',
    color: '#06b6d4',
    services: ['Coloración', 'Mechas', 'Tratamiento Capilar', 'Corte Mujer'],
    workingDays: [1, 2, 3, 4, 5],
    workingHours: { start: '10:00', end: '19:00' },
    stats: {
      appointmentsThisMonth: 38,
      revenueThisMonth: 98000,
      rating: 4.8,
      reviews: 89,
    },
  },
  {
    id: '3',
    name: 'Carlos Ruiz',
    email: 'carlos@teto.app',
    phone: '+54 11 3456 7890',
    title: 'Barber & Stylist',
    status: 'active',
    color: '#10b981',
    services: ['Corte Clásico', 'Degradado', 'Diseños', 'Barba Completa'],
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '17:00' },
    stats: {
      appointmentsThisMonth: 32,
      revenueThisMonth: 85000,
      rating: 4.7,
      reviews: 56,
    },
  },
  {
    id: '4',
    name: 'María González',
    email: 'maria@teto.app',
    phone: '+54 11 4567 8901',
    title: 'Junior Stylist',
    status: 'on_leave',
    color: '#f59e0b',
    services: ['Corte Clásico', 'Lavado', 'Secado'],
    workingDays: [2, 3, 4, 5, 6],
    workingHours: { start: '11:00', end: '19:00' },
    stats: {
      appointmentsThisMonth: 0,
      revenueThisMonth: 0,
      rating: 4.5,
      reviews: 23,
    },
  },
];

const statusConfig = {
  active: { label: 'Activo', variant: 'success' as const },
  inactive: { label: 'Inactivo', variant: 'secondary' as const },
  on_leave: { label: 'De licencia', variant: 'warning' as const },
};

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function StaffPage() {
  const [activeTab, setActiveTab] = React.useState('all');
  
  const totalRevenue = mockStaff.reduce((sum, s) => sum + s.stats.revenueThisMonth, 0);
  const totalAppointments = mockStaff.reduce((sum, s) => sum + s.stats.appointmentsThisMonth, 0);
  const activeStaff = mockStaff.filter((s) => s.status === 'active').length;

  // Filter staff based on active tab (will be used when rendering)
  const _filteredStaff = activeTab === 'all' 
    ? mockStaff 
    : mockStaff.filter((s) => s.status === activeTab);
  void _filteredStaff; // Used for filtering logic

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Personal
          </h1>
          <p className="mt-1 text-surface-500">
            Gestiona tu equipo de profesionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
            Agregar Profesional
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {staffTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Related section links */}
        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/calendar"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineCalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Horarios</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineScissors className="h-4 w-4" />
            <span className="hidden sm:inline">Servicios</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Total Profesionales</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {mockStaff.length}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{activeStaff}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Citas Este Mes</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">{totalAppointments}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Ingresos Totales</p>
            <p className="mt-1 text-3xl font-bold text-accent-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {mockStaff.map((staff) => (
          <Card key={staff.id} variant="elevated" className="card-hover overflow-hidden">
            <CardContent className="p-0">
              {/* Header with color */}
              <div
                className="h-2"
                style={{ backgroundColor: staff.color }}
              />
              
              <div className="p-6">
                {/* Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={staff.name} size="lg" />
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                        {staff.name}
                      </h3>
                      <p className="text-sm text-primary-600">{staff.title}</p>
                    </div>
                  </div>
                  <Badge variant={statusConfig[staff.status].variant}>
                    {statusConfig[staff.status].label}
                  </Badge>
                </div>

                {/* Contact */}
                <div className="mt-4 space-y-1 text-sm text-surface-500">
                  <p>{staff.email}</p>
                  <p>{staff.phone}</p>
                </div>

                {/* Working hours */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-surface-500">
                    <HiOutlineClock className="h-4 w-4" />
                    <span>
                      {staff.workingHours.start} - {staff.workingHours.end}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <span
                        key={day}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium',
                          staff.workingDays.includes(day)
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-surface-100 text-surface-400 dark:bg-surface-800'
                        )}
                      >
                        {dayNames[day]?.charAt(0)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-surface-500 uppercase">Servicios</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {staff.services.slice(0, 3).map((service) => (
                      <Badge key={service} variant="secondary" size="sm">
                        {service}
                      </Badge>
                    ))}
                    {staff.services.length > 3 && (
                      <Badge variant="secondary" size="sm">
                        +{staff.services.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-surface-200 pt-4 dark:border-surface-800">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                      {staff.stats.appointmentsThisMonth}
                    </p>
                    <p className="text-xs text-surface-500">Citas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">
                      ${(staff.stats.revenueThisMonth / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-surface-500">Ingresos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <HiOutlineStar className="h-4 w-4 text-yellow-500" />
                      <span className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                        {staff.stats.rating}
                      </span>
                    </div>
                    <p className="text-xs text-surface-500">{staff.stats.reviews} reseñas</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <HiOutlineCalendarDays className="mr-2 h-4 w-4" />
                    Horarios
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <HiOutlinePencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-red-600">
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

