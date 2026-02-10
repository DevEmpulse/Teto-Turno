'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

type Staff = {
  id: string;
  full_name?: string;
  title: string | null;
};

type PublicBusinessResponse = {
  id: string;
  name: string;
  slug: string;
  services: Service[];
  staff: Staff[];
};

export default function ConfirmPage({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const dateIso = searchParams.get('date');

  const [business, setBusiness] = React.useState<PublicBusinessResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
  });

  React.useEffect(() => {
    const loadBusiness = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    void loadBusiness();
  }, [businessSlug]);

  const selectedService = business?.services.find((service) => service.id === serviceId) ?? null;
  const selectedStaff =
    staffId === 'any' ? null : (business?.staff.find((person) => person.id === staffId) ?? null);

  const parsedDate = dateIso ? new Date(dateIso) : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!business || !selectedService || !dateIso) {
      setError('Faltan datos de la reserva. Regresa al paso anterior.');
      return;
    }

    if (!selectedStaff) {
      setError('Debes seleccionar un profesional específico para confirmar la cita.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          staff_id: selectedStaff.id,
          service_id: selectedService.id,
          scheduled_at: dateIso,
          duration_minutes: selectedService.duration_minutes,
          price: selectedService.price,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const result = (await response.json()) as { error?: string; appointment?: { id: string } };

      if (!response.ok) {
        setError(result.error ?? 'No se pudo confirmar la cita');
        return;
      }

      setSuccess('Reserva confirmada con éxito.');
      setTimeout(() => {
        router.push(`/book/${businessSlug}`);
      }, 1200);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-400">1. Servicio</span>
          <span className="text-surface-400">2. Profesional</span>
          <span className="text-surface-400">3. Horario</span>
          <span className="font-medium text-primary-600">4. Confirmar</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-200 dark:bg-surface-800">
          <div className="h-full w-full rounded-full bg-linear-to-r from-primary-500 to-primary-600" />
        </div>
      </div>

      <Link
        href={`/book/${businessSlug}/schedule?serviceId=${serviceId ?? ''}&staffId=${staffId ?? ''}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver a horarios
      </Link>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <Card variant="elevated" className="mb-6">
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Resumen</h2>
          {isLoading ? (
            <p className="mt-3 text-surface-500">Cargando resumen...</p>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-surface-700 dark:text-surface-200">
              <p>
                <strong>¿Qué te vas a hacer?</strong> {selectedService?.name ?? 'No definido'}
              </p>
              <p>
                <strong>¿Con quién?</strong> {selectedStaff?.full_name ?? 'Cualquier profesional'}
              </p>
              <p>
                <strong>¿Cuándo?</strong>{' '}
                {parsedDate
                  ? format(parsedDate, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
                  : 'No definido'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Tus datos</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              required
              placeholder="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              required
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />

            <Button className="w-full" variant="glow" type="submit" isLoading={isSubmitting}>
              Confirmar reserva
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
