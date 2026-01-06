'use client';

import * as React from 'react';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import {
  HiOutlineChartBar,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineScissors,
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

// Report type tabs
const reportTabs = [
  { id: 'overview', label: 'Resumen' },
  { id: 'services', label: 'Servicios' },
  { id: 'staff', label: 'Personal' },
  { id: 'clients', label: 'Clientes' },
];

// Mock data for reports
const monthlyData = eachMonthOfInterval({
  start: subMonths(new Date(), 11),
  end: new Date(),
}).map((month) => ({
  month,
  revenue: Math.floor(Math.random() * 200000) + 150000,
  appointments: Math.floor(Math.random() * 150) + 100,
  newClients: Math.floor(Math.random() * 30) + 10,
}));

const topServices = [
  { name: 'Corte + Barba', bookings: 156, revenue: 546000, growth: 12 },
  { name: 'Degradado / Fade', bookings: 142, revenue: 426000, growth: 18 },
  { name: 'Corte Clásico', bookings: 98, revenue: 245000, growth: -5 },
  { name: 'Coloración', bookings: 45, revenue: 247500, growth: 25 },
  { name: 'Barba Completa', bookings: 87, revenue: 156600, growth: 8 },
];

const topStaff = [
  { name: 'Juan Pérez', appointments: 145, revenue: 425000, rating: 4.9, color: '#8b5cf6' },
  { name: 'Ana López', appointments: 98, revenue: 320000, rating: 4.8, color: '#06b6d4' },
  { name: 'Carlos Ruiz', appointments: 87, revenue: 215000, rating: 4.7, color: '#10b981' },
];

const clientStats = {
  total: 1250,
  new: 45,
  returning: 85,
  churnRate: 5.2,
};

const kpis = [
  {
    label: 'Tasa de Ocupación',
    value: '87%',
    change: '+5%',
    positive: true,
    icon: HiOutlineCalendarDays,
  },
  {
    label: 'Clientes Recurrentes',
    value: '65%',
    change: '+8%',
    positive: true,
    icon: HiOutlineUsers,
  },
  {
    label: 'Ticket Promedio',
    value: '$3,200',
    change: '+12%',
    positive: true,
    icon: HiOutlineBanknotes,
  },
  {
    label: 'Tasa de Cancelación',
    value: '8%',
    change: '-3%',
    positive: true,
    icon: HiOutlineChartBar,
  },
];

export default function ReportsPage() {
  const [period, setPeriod] = React.useState<'week' | 'month' | 'year'>('month');
  const [activeReport, setActiveReport] = React.useState('overview');

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Reportes
          </h1>
          <p className="mt-1 text-surface-500">
            Analiza el rendimiento de tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl border border-surface-200 p-1 dark:border-surface-700">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
                )}
              >
                {p === 'week' && 'Semana'}
                {p === 'month' && 'Mes'}
                {p === 'year' && 'Año'}
              </button>
            ))}
          </div>
          <Button variant="outline" leftIcon={<HiOutlineArrowDownTray className="h-5 w-5" />}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Navigation Tabs and Links */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Report type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                activeReport === tab.id
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
            href="/admin/finance"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineBanknotes className="h-4 w-4" />
            <span className="hidden sm:inline">Finanzas</span>
          </Link>
          <Link
            href="/admin/staff"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineUserGroup className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineScissors className="h-4 w-4" />
            <span className="hidden sm:inline">Servicios</span>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="elevated">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">{kpi.label}</p>
                  <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
                    {kpi.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
              <p
                className={cn(
                  'mt-2 flex items-center gap-1 text-sm',
                  kpi.positive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {kpi.positive ? (
                  <HiOutlineArrowTrendingUp className="h-4 w-4" />
                ) : (
                  <HiOutlineArrowTrendingDown className="h-4 w-4" />
                )}
                {kpi.change} vs período anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ingresos Mensuales</CardTitle>
            <div className="text-right">
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-surface-500">Total anual</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end gap-2">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all hover:from-primary-500 hover:to-primary-300"
                    style={{ height: `${(data.revenue / maxRevenue) * 200}px` }}
                  />
                </div>
                <span className="text-xs text-surface-500">
                  {format(data.month, 'MMM', { locale: es })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top services */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineScissors className="h-5 w-5" />
              Top Servicios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, i) => (
                <div
                  key={service.name}
                  className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {service.name}
                    </p>
                    <p className="text-sm text-surface-500">
                      {service.bookings} reservas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-surface-900 dark:text-surface-50">
                      ${service.revenue.toLocaleString()}
                    </p>
                    <p
                      className={cn(
                        'flex items-center justify-end gap-1 text-sm',
                        service.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {service.growth >= 0 ? (
                        <HiOutlineArrowTrendingUp className="h-4 w-4" />
                      ) : (
                        <HiOutlineArrowTrendingDown className="h-4 w-4" />
                      )}
                      {service.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top staff */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineUsers className="h-5 w-5" />
              Top Profesionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStaff.map((staff, i) => (
                <div
                  key={staff.name}
                  className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: staff.color }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {staff.name}
                    </p>
                    <p className="text-sm text-surface-500">
                      {staff.appointments} citas • ⭐ {staff.rating}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${staff.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client stats */}
      <Card variant="gradient">
        <CardHeader>
          <CardTitle>Resumen de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-surface-900 dark:text-surface-50">
                {clientStats.total.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-surface-500">Clientes Totales</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                +{clientStats.new}
              </p>
              <p className="mt-1 text-sm text-surface-500">Nuevos Este Mes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">
                {clientStats.returning}%
              </p>
              <p className="mt-1 text-sm text-surface-500">Tasa de Retención</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">
                {clientStats.churnRate}%
              </p>
              <p className="mt-1 text-sm text-surface-500">Tasa de Abandono</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

