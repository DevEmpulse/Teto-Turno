'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Avatar } from '@/presentation/components/ui/avatar';

export default function ConfirmPage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service');
  const staffId = searchParams.get('staff');
  const dateTimeParam = searchParams.get('datetime');

  const [isLoading, setIsLoading] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Parse the datetime
  const dateTime = dateTimeParam ? parseISO(dateTimeParam) : new Date();

  // Mock data - in real app, fetch based on IDs
  const bookingDetails = {
    service: {
      name: 'Corte + Barba',
      duration: 45,
      price: 3500,
    },
    staff: {
      name: staffId === 'any' ? 'Próximo disponible' : 'Juan Pérez',
      title: 'Senior Barber',
    },
    date: dateTime,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsConfirmed(true);
    setIsLoading(false);
  };

  if (isConfirmed) {
    return (
      <div className="animate-in flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
          <HiOutlineCheck className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          ¡Reserva Confirmada!
        </h1>
        <p className="mt-2 text-surface-500">
          Te enviamos un email con los detalles de tu cita
        </p>

        <Card variant="elevated" className="mt-8 w-full max-w-sm">
          <CardContent>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <HiOutlineCalendar className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {format(bookingDetails.date, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-sm text-surface-500">
                    {format(bookingDetails.date, 'HH:mm')} hs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlineClock className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {bookingDetails.service.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {bookingDetails.service.duration} minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlineUser className="h-5 w-5 text-surface-400" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {bookingDetails.staff.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {bookingDetails.staff.title}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
          <Button variant="glow" onClick={() => router.push(`/book/${params.businessSlug}`)}>
            Nueva reserva
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="font-medium text-primary-600">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      {/* Back button */}
      <Link
        href={`/book/${params.businessSlug}/schedule?service=${serviceId}&staff=${staffId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a horarios
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Confirma tu reserva
        </h1>
        <p className="mt-1 text-surface-500">
          Revisa los detalles y completa tu información
        </p>
      </div>

      {/* Booking summary */}
      <Card variant="gradient" className="mb-6">
        <CardContent>
          <h2 className="mb-4 font-semibold text-surface-900 dark:text-surface-50">
            Resumen de tu cita
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-xl dark:bg-primary-900/30">
                  ✂️
                </div>
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {bookingDetails.service.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {bookingDetails.service.duration} minutos
                  </p>
                </div>
              </div>
              <p className="font-semibold text-surface-900 dark:text-surface-50">
                ${bookingDetails.service.price.toLocaleString()}
              </p>
            </div>

            <div className="border-t border-surface-200 pt-4 dark:border-surface-700">
              <div className="flex items-center gap-3">
                <Avatar name={bookingDetails.staff.name} />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {bookingDetails.staff.name}
                  </p>
                  <p className="text-sm text-surface-500">
                    {format(bookingDetails.date, "EEEE d 'de' MMMM", { locale: es })} a las{' '}
                    {format(bookingDetails.date, 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact form */}
      <form onSubmit={handleSubmit}>
        <Card variant="elevated" className="mb-6">
          <CardContent>
            <h2 className="mb-4 font-semibold text-surface-900 dark:text-surface-50">
              Tus datos
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Nombre completo
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  required
                  placeholder="+54 11 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Notas (opcional)
                </label>
                <textarea
                  placeholder="Algo que debamos saber..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-surface-300 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          variant="glow"
          isLoading={isLoading}
        >
          Confirmar Reserva
        </Button>

        <p className="mt-4 text-center text-xs text-surface-500">
          Al confirmar, aceptas nuestros{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">
            términos de servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            política de privacidad
          </Link>
        </p>
      </form>
    </div>
  );
}

