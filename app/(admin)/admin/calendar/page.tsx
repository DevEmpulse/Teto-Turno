'use client';

import * as React from 'react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { cn } from '@/lib/utils';
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

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

function getClientName(a: AppointmentApi): string {
  return a.customers?.full_name?.trim() || 'Cliente Invitado';
}

function getServiceName(a: AppointmentApi): string {
  return a.services?.name?.trim() || 'Servicio no definido';
}

function getStaffName(a: AppointmentApi): string {
  const s = a.staff;
  if (s?.full_name) return s.full_name.trim();
  if (s?.title) return s.title.trim();
  return 'Profesional';
}

function getClientContact(a: AppointmentApi): string | null {
  const email = a.customers?.email?.trim();
  const phone = a.customers?.phone?.trim();
  if (email && phone) return `${email} · ${phone}`;
  if (email) return email;
  if (phone) return phone;
  return null;
}

function formatFriendlyDate(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return `Hoy a las ${format(d, 'HH:mm')}`;
  return format(d, "EEE d MMM 'a las' HH:mm", { locale: es });
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset);
  return local.toISOString().slice(0, 16);
}

function getDaysForMonthView(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let current = calendarStart;
  while (current <= calendarEnd) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export default function CalendarPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [appointments, setAppointments] = React.useState<AppointmentApi[]>([]);
  const [services, setServices] = React.useState<ServiceOption[]>([]);
  const [staff, setStaff] = React.useState<StaffOption[]>([]);
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
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

  const editableStatuses = ['pending', 'confirmed'];

  const appointmentsByDate = React.useMemo(() => {
    const map = new Map<string, AppointmentApi[]>();
    for (const apt of appointments) {
      const key = format(parseISO(apt.scheduled_at), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }
    return map;
  }, [appointments]);

  const selectedDateAppointments = React.useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return appointmentsByDate.get(key) ?? [];
  }, [selectedDate, appointmentsByDate]);

  const calendarDays = React.useMemo(() => getDaysForMonthView(currentMonth), [currentMonth]);

  React.useEffect(() => {
    const loadBusinesses = async () => {
      const res = await fetch('/api/businesses', { cache: 'no-store' });
      const json = (await res.json()) as { businesses?: Business[]; error?: string };
      if (!res.ok) {
        setErrorMessage(json.error ?? 'Error al cargar negocios');
        return;
      }
      const list = json.businesses ?? [];
      setBusinesses(list);
      const firstId = list[0]?.id;
      if (firstId && !selectedBusinessId) setSelectedBusinessId(firstId);
    };
    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    if (!selectedBusinessId) return;
    setIsLoading(true);
    setErrorMessage(null);
    Promise.all([
      fetch(`/api/appointments?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
      fetch(`/api/services?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
      fetch(`/api/staff?businessId=${selectedBusinessId}`, { cache: 'no-store' }),
    ])
      .then(async ([aRes, sRes, stRes]) => {
        const [aJson, sJson, stJson] = await Promise.all([
          aRes.json() as Promise<{ appointments?: AppointmentApi[] }>,
          sRes.json() as Promise<{ services?: ServiceOption[] }>,
          stRes.json() as Promise<{ staff?: StaffOption[] }>,
        ]);
        setAppointments(aJson.appointments ?? []);
        setServices(sJson.services ?? []);
        setStaff(stJson.staff ?? []);
      })
      .catch(() => setErrorMessage('Error de conexión'))
      .finally(() => setIsLoading(false));
  }, [selectedBusinessId]);

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
      setSuccessMessage('Cita actualizada');
      setModalOpen(null);
      setEditingAppointment(null);
      if (selectedBusinessId) {
        const r = await fetch(`/api/appointments?businessId=${selectedBusinessId}`, {
          cache: 'no-store',
        });
        const j = (await r.json()) as { appointments?: AppointmentApi[] };
        setAppointments(j.appointments ?? []);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar');
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
        body: JSON.stringify({ status: 'cancelled', notes: cancelNotes.trim() || undefined }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cancelar');
      setSuccessMessage('Cita cancelada');
      setModalOpen(null);
      setCancellingAppointment(null);
      if (selectedBusinessId) {
        const r = await fetch(`/api/appointments?businessId=${selectedBusinessId}`, {
          cache: 'no-store',
        });
        const j = (await r.json()) as { appointments?: AppointmentApi[] };
        setAppointments(j.appointments ?? []);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al cancelar');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Calendario</h1>
          <p className="mt-1 text-surface-500">Visualiza y gestiona las citas por día.</p>
        </div>
        <div className="w-full sm:w-64">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-surface-500">
            Negocio
          </label>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
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

      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HiOutlineCalendarDays className="h-5 w-5" />
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
              aria-label="Mes anterior"
            >
              <HiOutlineChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
              aria-label="Mes siguiente"
            >
              <HiOutlineChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-12 text-center text-surface-500">Cargando calendario...</p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-px rounded-xl border border-surface-200 bg-surface-200 dark:border-surface-700 dark:bg-surface-700">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="bg-surface-50 px-2 py-2 text-center text-xs font-medium uppercase text-surface-500 dark:bg-surface-900 dark:text-surface-400"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayAppointments = appointmentsByDate.get(key) ?? [];
                  const activeCount = dayAppointments.filter(
                    (a) => !['cancelled', 'no_show'].includes(a.status)
                  ).length;
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'min-h-[80px] cursor-pointer border-0 bg-white p-2 text-left transition-colors dark:bg-surface-900',
                        !isCurrentMonth && 'text-surface-300 dark:text-surface-600',
                        isSelected && 'ring-2 ring-primary-500 ring-inset',
                        isToday(day) && !isSelected && 'bg-primary-50/50 dark:bg-primary-900/10'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                          isToday(day) && 'bg-primary-600 text-white',
                          !isToday(day) && 'text-surface-700 dark:text-surface-200'
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                      {activeCount > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {activeCount <= 2 ? (
                            dayAppointments
                              .filter((a) => !['cancelled', 'no_show'].includes(a.status))
                              .slice(0, 2)
                              .map((a) => (
                                <span
                                  key={a.id}
                                  className="block truncate rounded bg-primary-100 px-1 text-xs text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                                  title={`${format(parseISO(a.scheduled_at), 'HH:mm')} - ${getClientName(a)}`}
                                >
                                  {format(parseISO(a.scheduled_at), 'HH:mm')}
                                </span>
                              ))
                          ) : (
                            <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                              {activeCount} citas
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 border-t border-surface-200 pt-6 dark:border-surface-800">
                  <h3 className="mb-4 text-lg font-semibold text-surface-900 dark:text-surface-50">
                    Citas del {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </h3>
                  {selectedDateAppointments.length === 0 ? (
                    <p className="text-sm text-surface-500">No hay citas para este día.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateAppointments.map((apt) => {
                        const date = parseISO(apt.scheduled_at);
                        const canEdit = editableStatuses.includes(apt.status);
                        return (
                          <div
                            key={apt.id}
                            className="flex flex-col gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3 dark:border-surface-800 dark:bg-surface-900 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-surface-900 dark:text-surface-50">
                                {format(date, 'HH:mm')} · {getClientName(apt)}
                              </p>
                              <p className="text-sm text-surface-500">
                                {getServiceName(apt)} · {getStaffName(apt)}
                              </p>
                              {getClientContact(apt) && (
                                <p className="truncate text-xs text-surface-400">
                                  {getClientContact(apt)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(apt.status)} dot>
                                {getStatusLabel(apt.status)}
                              </Badge>
                              {canEdit && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => openEdit(apt)}
                                    aria-label="Editar"
                                  >
                                    <HiOutlinePencilSquare className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-red-600 hover:bg-red-50 dark:hover:text-red-400"
                                    onClick={() => openCancel(apt)}
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
                </div>
              )}
            </>
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
            <p className="text-sm text-surface-500">Cliente: {getClientName(editingAppointment)}</p>
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
                className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
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
                className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(null)}>
                No cancelar
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                Sí, cancelar cita
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
