'use client';

import * as React from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import {
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineCreditCard,
  HiOutlineReceiptPercent,
  HiOutlineChartBar,
  HiOutlineScissors,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { cn } from '@/lib/utils';

// Time period tabs
const periodTabs = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mes' },
  { id: 'year', label: 'Este Año' },
];

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago';
type TransactionStatus = 'completed' | 'pending' | 'refunded';

interface Transaction {
  id: string;
  client: string;
  service: string;
  staff: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  date: Date;
}

// Generate mock transactions
const generateTransactions = (): Transaction[] => {
  const methods: PaymentMethod[] = ['cash', 'card', 'transfer', 'mercadopago'];
  const services = ['Corte Clásico', 'Corte + Barba', 'Barba Completa', 'Coloración', 'Tratamiento'];
  const clients = ['Carlos R.', 'María G.', 'Pedro M.', 'Laura S.', 'Diego F.', 'Ana L.'];
  const staff = ['Juan Pérez', 'Ana López', 'Carlos Ruiz'];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `txn-${i + 1}`,
    client: clients[Math.floor(Math.random() * clients.length)] ?? 'Cliente',
    service: services[Math.floor(Math.random() * services.length)] ?? 'Servicio',
    staff: staff[Math.floor(Math.random() * staff.length)] ?? 'Staff',
    amount: Math.floor(Math.random() * 4000) + 1500,
    method: methods[Math.floor(Math.random() * methods.length)] ?? 'cash',
    status: Math.random() > 0.1 ? 'completed' : Math.random() > 0.5 ? 'pending' : 'refunded',
    date: subDays(new Date(), Math.floor(Math.random() * 30)),
  }));
};

const mockTransactions = generateTransactions();

// Generate chart data
const last7Days = eachDayOfInterval({
  start: subDays(new Date(), 6),
  end: new Date(),
});

const chartData = last7Days.map((day) => ({
  date: day,
  revenue: Math.floor(Math.random() * 30000) + 15000,
}));

const methodConfig: Record<PaymentMethod, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: 'Efectivo', icon: HiOutlineBanknotes, color: 'text-green-600' },
  card: { label: 'Tarjeta', icon: HiOutlineCreditCard, color: 'text-blue-600' },
  transfer: { label: 'Transferencia', icon: HiOutlineArrowTrendingUp, color: 'text-purple-600' },
  mercadopago: { label: 'MercadoPago', icon: HiOutlineReceiptPercent, color: 'text-cyan-600' },
};

const statusConfig: Record<TransactionStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  completed: { label: 'Completado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  refunded: { label: 'Reembolsado', variant: 'danger' },
};

export default function FinancePage() {
  const [period, setPeriod] = React.useState('month');

  const totalRevenue = mockTransactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = mockTransactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = mockTransactions
    .filter((t) => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionsByMethod = mockTransactions.reduce(
    (acc, t) => {
      acc[t.method] = (acc[t.method] ?? 0) + t.amount;
      return acc;
    },
    {} as Record<PaymentMethod, number>
  );

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Finanzas
          </h1>
          <p className="mt-1 text-surface-500">
            Controla los ingresos de tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<HiOutlineArrowDownTray className="h-5 w-5" />}>
            Exportar
          </Button>
          <Button variant="glow" leftIcon={<HiOutlineBanknotes className="h-5 w-5" />}>
            Registrar Pago
          </Button>
        </div>
      </div>

      {/* Navigation and Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periodTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                period === tab.id
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
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineScissors className="h-4 w-4" />
            <span className="hidden sm:inline">Servicios</span>
          </Link>
          <Link
            href="/admin/staff"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineUserGroup className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Ingresos Totales</p>
                <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30">
                <HiOutlineArrowTrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600">
              +15% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-yellow-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Pendientes</p>
                <p className="mt-1 text-3xl font-bold text-yellow-600">
                  ${totalPending.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
                <HiOutlineCalendarDays className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-sm text-surface-500">
              {mockTransactions.filter((t) => t.status === 'pending').length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-red-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Reembolsos</p>
                <p className="mt-1 text-3xl font-bold text-red-600">
                  ${totalRefunded.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
                <HiOutlineArrowTrendingDown className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-sm text-surface-500">
              {mockTransactions.filter((t) => t.status === 'refunded').length} reembolsos
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border-l-4 border-l-primary-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Promedio por Cita</p>
                <p className="mt-1 text-3xl font-bold text-primary-600">
                  ${Math.round(totalRevenue / mockTransactions.filter((t) => t.status === 'completed').length).toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                <HiOutlineReceiptPercent className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-sm text-surface-500">
              {mockTransactions.filter((t) => t.status === 'completed').length} citas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos Últimos 7 Días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-2">
              {chartData.map((day, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all hover:from-primary-500 hover:to-primary-300"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="text-xs text-surface-500">
                    {format(day.date, 'EEE', { locale: es })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment methods */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(transactionsByMethod).map(([method, amount]) => {
                const config = methodConfig[method as PaymentMethod];
                const percentage = Math.round((amount / totalRevenue) * 100);
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <config.icon className={cn('h-4 w-4', config.color)} />
                        <span className="text-surface-700 dark:text-surface-300">
                          {config.label}
                        </span>
                      </div>
                      <span className="font-medium text-surface-900 dark:text-surface-50">
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
                      <div
                        className="h-full rounded-full bg-primary-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card variant="elevated" padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50 text-left dark:border-surface-800 dark:bg-surface-900">
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Cliente</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Servicio</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Profesional</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Método</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Estado</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Monto</th>
                <th className="px-6 py-4 text-sm font-medium text-surface-500">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.slice(0, 10).map((txn) => {
                const methodInfo = methodConfig[txn.method];
                return (
                  <tr
                    key={txn.id}
                    className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-900/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={txn.client} size="sm" />
                        <span className="font-medium text-surface-900 dark:text-surface-50">
                          {txn.client}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {txn.service}
                    </td>
                    <td className="px-6 py-4 text-surface-600 dark:text-surface-400">
                      {txn.staff}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <methodInfo.icon className={cn('h-4 w-4', methodInfo.color)} />
                        <span className="text-sm">{methodInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusConfig[txn.status].variant}>
                        {statusConfig[txn.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'font-semibold',
                          txn.status === 'refunded' ? 'text-red-600' : 'text-surface-900 dark:text-surface-50'
                        )}
                      >
                        {txn.status === 'refunded' && '-'}${txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500">
                      {format(txn.date, 'd MMM', { locale: es })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

