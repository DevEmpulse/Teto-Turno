'use client';

import * as React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlinePencilSquare,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Modal } from '@/presentation/components/ui/modal';
import { Input } from '@/presentation/components/ui/input';

type Business = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

type StaffOption = {
  id: string;
  full_name?: string;
  title: string | null;
};

type AppointmentApi = {
  id: string;
  scheduled_at: string;
  status: string;
  staff_id?: string;
  service_id?: string;
  duration_minutes?: number;
  price?: number;
  customers?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  services?: {
    id?: string;
    name?: string | null;
    duration_minutes?: number | null;
    price?: number | null;
  } | null;
  staff?: {
    id?: string;
    full_name?: string | null;
    title?: string | null;
  } | null;
};

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
  if (status === 'confirmed' || status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled' || status === 'no_show') return 'danger';
  if (status === 'in_progress') return 'info';
  return 'secondary';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    no_show: 'No asistió',
  };
  return map[status] ?? status;
}

function getClientName(appointment: AppointmentApi): string {
  return appointment.customers?.full_name?.trim() || 'Cliente Invitado';
}

function getServiceName(appointment: AppointmentApi): string {
  return appointment.services?.name?.trim() || 'Servicio no definido';
}

function getStaffName(appointment: AppointmentApi): string {
  const staff = appointment.staff;
  if (staff?.full_name) return staff.full_name.trim();
  if (staff?.title) return staff.title.trim();
  return 'Profesional no asignado';
}

function getClientContact(appointment: AppointmentApi): string | null {
  const email = appointment.customers?.email?.trim();
  const phone = appointment.customers?.phone?.trim();
  if (email && phone) return `${email} · ${phone}`;
  if (email) return email;
  if (phone) return phone;
  return null;
}

function formatFriendlyDate(isoDate: string): string {
  const parsedDate = parseISO(isoDate);
  if (isToday(parsedDate)) {
    return `Hoy a las ${format(parsedDate, 'HH:mm')}`;
  }
  return format(parsedDate, "EEE d MMM 'a las' HH:mm", { locale: es });
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset);
  return local.toISOString().slice(0, 16);
}

export default function AppointmentsPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [appointments, setAppointments] = React.useState<AppointmentApi[]>([]);
  const [services, setServices] = React.useState<ServiceOption[]>([]);
  const [staff, setStaff] = React.useState<StaffOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState<'edit' | 'cancel' | null>(null);
  const [editingAppointment, setEditingAppointment] = React.useState<AppointmentApi | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = React.useState<AppointmentApi | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    staff_id: '',
    service_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    price: '',
    notes: '',
  });
  const [cancelNotes, setCancelNotes] = React.useState('');

  const loadAppointments = React.useCallback(async () => {
    if (!selectedBusinessId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/appointments?businessId=${selectedBusinessId}`, { cache: 'no-store' });
      const json = (await res.json()) as { appointments?: AppointmentApi[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar citas');
      const list = json.appointments ?? [];
      setAppointments(
        [...list].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )
      );
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusinessId]);

  const loadServicesAndStaff = React.useCallback(async () => {
    if (!selectedBusinessId) return;
    try {
      const [svcRes, staffRes] = await Promise.all([
        fetch(`/api/services?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
        fetch(`/api/staff?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
      ]);
      const svcJson = (await svcRes.json()) as { services?: ServiceOption[] };
      const staffJson = (await staffRes.json()) as { staff?: StaffOption[] };
      setServices(svcJson.services ?? []);
      setStaff(staffJson.staff ?? []);
    } catch {
      setServices([]);
      setStaff([]);
    }
  }, [selectedBusinessId]);

  React.useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/businesses', { cache: 'no-store' });
        const json = (await res.json()) as { businesses?: Business[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
        const fetched = json.businesses ?? [];
        setBusinesses(fetched);
        setSelectedBusinessId(fetched[0]?.id ?? '');
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      } finally {
        setIsLoading(false);
      }
    };
    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    if (selectedBusinessId) {
      void loadAppointments();
      void loadServicesAndStaff();
    } else {
      setAppointments([]);
      setServices([]);
      setStaff([]);
    }
  }, [selectedBusinessId, loadAppointments, loadServicesAndStaff]);

  const openEdit = (apt: AppointmentApi) => {
    setEditingAppointment(apt);
    const svc = apt.services;
    const dur = apt.duration_minutes ?? svc?.duration_minutes ?? 30;
    const prc = apt.price ?? svc?.price ?? 0;
    setFormData({
      staff_id: apt.staff_id ?? apt.staff?.id ?? '',
      service_id: apt.service_id ?? apt.services?.id ?? '',
      scheduled_at: toDateTimeLocal(apt.scheduled_at),
      duration_minutes: dur,
      price: String(prc / 100),
      notes: '',
    });
    setFormError(null);
    setModalOpen('edit');
  };

  const openCancel = (apt: AppointmentApi) => {
    setCancellingAppointment(apt);
    setCancelNotes('');
    setFormError(null);
    setModalOpen('cancel');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    setFormError(null);
    setIsSubmitting(true);
    const priceNum = parseFloat(formData.price.replace(/[^\d.]/g, '')) || 0;
    const priceCentavos = Math.round(priceNum * 100);
    try {
      const res = await fetch(`/api/appointments/${editingAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: formData.staff_id || undefined,
          service_id: formData.service_id || undefined,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration_minutes: formData.duration_minutes,
          price: priceCentavos,
          notes: formData.notes.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al actualizar');
      setSuccessMessage('Cita actualizada correctamente');
      setModalOpen(null);
      setEditingAppointment(null);
      void loadAppointments();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellingAppointment) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/appointments/${cancellingAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          notes: cancelNotes.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cancelar');
      setSuccessMessage('Cita cancelada');
      setModalOpen(null);
      setCancellingAppointment(null);
      void loadAppointments();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al cancelar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onServiceChange = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setFormData((p) => ({
        ...p,
        service_id: serviceId,
        duration_minutes: svc.duration_minutes,
        price: String(svc.price / 100),
      }));
    } else {
      setFormData((p) => ({ ...p, service_id: serviceId }));
    }
  };

  React.useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const editableStatuses = ['pending', 'confirmed'];

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Citas</h1>
        <p className="mt-1 text-surface-500">Gestiona las citas de tu negocio.</p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/50">
          {successMessage}
        </div>
      )}

      <div className="max-w-sm">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-500">
          Negocio
        </label>
        <select
          value={selectedBusinessId}
          onChange={(e) => setSelectedBusinessId(e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
        >
          {businesses.length === 0 ? (
            <option value="">Sin negocios</option>
          ) : (
            businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))
          )}
        </select>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-surface-500">Cargando citas...</p>
          ) : appointments.length === 0 ? (
            <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-8 text-center text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
              Aún no tienes citas registradas para este negocio.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => {
                const date = parseISO(appointment.scheduled_at);
                const clientName = getClientName(appointment);
                const serviceName = getServiceName(appointment);
                const staffName = getStaffName(appointment);
                const clientContact = getClientContact(appointment);
                const canEdit = editableStatuses.includes(appointment.status);

                return (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-4 rounded-xl border border-surface-200 bg-white px-4 py-4 shadow-sm transition-all hover:shadow-md dark:border-surface-800 dark:bg-surface-900 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-surface-900 dark:text-surface-50">
                        {clientName}
                      </p>
                      {clientContact && (
                        <p title={clientContact} className="truncate text-xs text-surface-500">
                          {clientContact}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium text-surface-700 dark:text-surface-200">
                        {formatFriendlyDate(appointment.scheduled_at)}
                      </p>
                      <p className="mt-1 truncate text-sm text-surface-500 dark:text-surface-400">
                        {serviceName} · {staffName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-surface-900 dark:text-surface-50">
                        {format(date, 'HH:mm')} hs
                      </span>
                      <Badge variant={getStatusBadgeVariant(appointment.status)} dot>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(appointment)}
                            aria-label="Editar"
                          >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:text-red-400"
                            onClick={() => openCancel(appointment)}
                            aria-label="Cancelar"
                          >
                            <HiOutlineXCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen === 'edit'}
        onClose={() => {
          setModalOpen(null);
          setEditingAppointment(null);
        }}
        title="Editar cita"
      >
        {editingAppointment && (
          <form onSubmit={handleEdit} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
                {formError}
              </div>
            )}
            <p className="text-sm text-surface-500">
              Cliente: {getClientName(editingAppointment)}
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Profesional *
              </label>
              <select
                required
                value={formData.staff_id}
                onChange={(e) => setFormData((p) => ({ ...p, staff_id: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              >
                <option value="">Seleccionar...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name ?? s.title ?? s.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Servicio *
              </label>
              <select
                required
                value={formData.service_id}
                onChange={(e) => onServiceChange(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              >
                <option value="">Seleccionar...</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} min - ${(s.price / 100).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Fecha y hora *
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.scheduled_at}
                onChange={(e) => setFormData((p) => ({ ...p, scheduled_at: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Duración (min)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, duration_minutes: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Precio (ARS)
                </label>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  placeholder="3500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Notas adicionales"
                rows={2}
                className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="glow" isLoading={isSubmitting}>
                Guardar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={modalOpen === 'cancel'}
        onClose={() => {
          setModalOpen(null);
          setCancellingAppointment(null);
        }}
        title="Cancelar cita"
      >
        {cancellingAppointment && (
          <div className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <p className="text-surface-600 dark:text-surface-400">
              ¿Estás seguro de que deseas cancelar la cita de{' '}
              <strong>{getClientName(cancellingAppointment)}</strong> el{' '}
              {formatFriendlyDate(cancellingAppointment.scheduled_at)}?
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Motivo (opcional)
              </label>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Ej: Cliente solicitó reprogramar"
                rows={2}
                className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(null)}>
                No cancelar
              </Button>
              <Button variant="destructive" onClick={handleCancel} isLoading={isSubmitting}>
                Sí, cancelar cita
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
