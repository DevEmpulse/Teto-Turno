import type { Metadata } from 'next/types';
import Link from 'next/link';
import {
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineArrowTrendingUp,
  HiOutlineCalendar,
  HiOutlineScissors,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';

// Quick navigation items
const quickActions = [
  {
    title: 'Nueva Cita',
    description: 'Agendar una cita manualmente',
    href: '/admin/appointments',
    icon: HiOutlinePlus,
    color: 'bg-primary-600 text-white',
  },
  {
    title: 'Calendario',
    description: 'Ver agenda del día',
    href: '/admin/calendar',
    icon: HiOutlineCalendar,
    color: 'bg-accent-600 text-white',
  },
  {
    title: 'Servicios',
    description: 'Gestionar servicios',
    href: '/admin/services',
    icon: HiOutlineScissors,
    color: 'bg-green-600 text-white',
  },
  {
    title: 'Reportes',
    description: 'Ver estadísticas',
    href: '/admin/reports',
    icon: HiOutlineChartBar,
    color: 'bg-orange-600 text-white',
  },
];

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Panel de control de tu negocio',
};

// Mock data for demonstration
const stats = [
  {
    title: 'Citas Hoy',
    value: '12',
    change: '+2 vs ayer',
    trend: 'up',
    icon: HiOutlineCalendarDays,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
  },
  {
    title: 'Ingresos del Mes',
    value: '$245,000',
    change: '+15% vs mes anterior',
    trend: 'up',
    icon: HiOutlineBanknotes,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'Clientes Nuevos',
    value: '34',
    change: '+8 esta semana',
    trend: 'up',
    icon: HiOutlineUsers,
    color: 'text-accent-600',
    bgColor: 'bg-accent-100 dark:bg-accent-900/30',
  },
  {
    title: 'Tasa de Ocupación',
    value: '87%',
    change: '+5% vs promedio',
    trend: 'up',
    icon: HiOutlineArrowTrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
];

const upcomingAppointments = [
  {
    id: '1',
    client: 'Carlos Rodríguez',
    service: 'Corte + Barba',
    time: '10:00',
    staff: 'Juan Pérez',
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'María García',
    service: 'Coloración',
    time: '10:30',
    staff: 'Ana López',
    status: 'pending',
  },
  {
    id: '3',
    client: 'Pedro Martínez',
    service: 'Corte Clásico',
    time: '11:00',
    staff: 'Juan Pérez',
    status: 'confirmed',
  },
  {
    id: '4',
    client: 'Laura Sánchez',
    service: 'Tratamiento Capilar',
    time: '11:30',
    staff: 'Ana López',
    status: 'confirmed',
  },
];

const topStaff = [
  { name: 'Juan Pérez', appointments: 45, revenue: 125000 },
  { name: 'Ana López', appointments: 38, revenue: 98000 },
  { name: 'Carlos Ruiz', appointments: 32, revenue: 85000 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          ¡Buen día! 👋
        </h1>
        <p className="mt-1 text-surface-500">
          Aquí está el resumen de tu negocio para hoy, Lunes 5 de Enero.
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`rounded-xl p-3 ${action.color}`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 dark:text-surface-50">
                    {action.title}
                  </p>
                  <p className="text-sm text-surface-500">{action.description}</p>
                </div>
                <HiOutlineArrowRight className="h-5 w-5 text-surface-400 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} variant="elevated" className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-surface-900 dark:text-surface-50">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximas Citas</CardTitle>
              <Link
                href="/admin/appointments"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-900"
                >
                  <Avatar name={appointment.client} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {appointment.client}
                    </p>
                    <p className="text-sm text-surface-500">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {appointment.time}
                    </p>
                    <p className="text-sm text-surface-500">{appointment.staff}</p>
                  </div>
                  <Badge
                    variant={appointment.status === 'confirmed' ? 'success' : 'warning'}
                  >
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Staff */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Top Profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStaff.map((staff, index) => (
                <div
                  key={staff.name}
                  className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <Avatar name={staff.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 dark:text-surface-50">
                      {staff.name}
                    </p>
                    <p className="text-sm text-surface-500">
                      {staff.appointments} citas este mes
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    ${staff.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                ¿Listo para recibir más clientes?
              </h3>
              <p className="text-surface-500">
                Comparte tu link de reservas y deja que los clientes agenden directamente.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl bg-primary-600 px-6 py-3 font-medium text-white transition-all hover:bg-primary-700 hover:shadow-glow">
                Copiar Link
              </button>
              <button className="rounded-xl border border-surface-300 bg-white px-6 py-3 font-medium text-surface-700 transition-all hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:hover:bg-surface-700">
                Ver Preview
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

