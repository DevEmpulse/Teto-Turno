/**
 * Appointment Entity - Domain Layer
 * Represents a booking/appointment in the system
 */

export type AppointmentStatus = 
  | 'pending'      // Awaiting confirmation
  | 'confirmed'    // Confirmed by business
  | 'in_progress'  // Currently being serviced
  | 'completed'    // Service completed
  | 'cancelled'    // Cancelled by client or business
  | 'no_show';     // Client didn't show up

export type CancellationReason =
  | 'client_request'
  | 'staff_unavailable'
  | 'business_closed'
  | 'schedule_conflict'
  | 'other';

export interface Appointment {
  readonly id: string;
  readonly businessId: string;
  readonly clientId: string;
  readonly staffId: string;
  readonly serviceId: string;
  readonly status: AppointmentStatus;
  readonly scheduledAt: Date; // Start time of the appointment
  readonly endAt: Date;       // End time (calculated from service duration)
  readonly durationMinutes: number;
  readonly price: number;     // Price at time of booking (in cents)
  readonly currency: string;
  readonly notes?: string;    // Client notes
  readonly internalNotes?: string; // Staff/admin notes
  readonly cancellationReason?: CancellationReason;
  readonly cancelledAt?: Date;
  readonly cancelledBy?: string; // User ID who cancelled
  readonly confirmedAt?: Date;
  readonly completedAt?: Date;
  readonly reminderSentAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateAppointmentInput {
  businessId: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  currency: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  staffId?: string;
  scheduledAt?: Date;
  status?: AppointmentStatus;
  notes?: string;
  internalNotes?: string;
}

export interface CancelAppointmentInput {
  appointmentId: string;
  reason: CancellationReason;
  cancelledBy: string;
}

// Domain logic: Check if appointment can be cancelled
export function canCancelAppointment(appointment: Appointment): boolean {
  const cancellableStatuses: AppointmentStatus[] = ['pending', 'confirmed'];
  return cancellableStatuses.includes(appointment.status);
}

// Domain logic: Check if appointment can be rescheduled
export function canRescheduleAppointment(appointment: Appointment): boolean {
  const reschedulableStatuses: AppointmentStatus[] = ['pending', 'confirmed'];
  return reschedulableStatuses.includes(appointment.status);
}

// Domain logic: Check if appointment is in the past
export function isAppointmentPast(appointment: Appointment): boolean {
  return new Date(appointment.scheduledAt) < new Date();
}

// Domain logic: Check if appointment is upcoming (within next 24 hours)
export function isAppointmentUpcoming(appointment: Appointment, hoursAhead = 24): boolean {
  const now = new Date();
  const appointmentTime = new Date(appointment.scheduledAt);
  const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 0 && hoursUntil <= hoursAhead;
}

// Domain logic: Calculate end time from start and duration
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000);
}

// Domain logic: Check for time slot overlap
export function doAppointmentsOverlap(
  appointment1: Pick<Appointment, 'scheduledAt' | 'endAt'>,
  appointment2: Pick<Appointment, 'scheduledAt' | 'endAt'>
): boolean {
  const start1 = new Date(appointment1.scheduledAt).getTime();
  const end1 = new Date(appointment1.endAt).getTime();
  const start2 = new Date(appointment2.scheduledAt).getTime();
  const end2 = new Date(appointment2.endAt).getTime();
  
  return start1 < end2 && start2 < end1;
}

// Value Object: Get status display info
export function getStatusDisplayInfo(status: AppointmentStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<AppointmentStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    confirmed: { label: 'Confirmado', color: 'text-green-600', bgColor: 'bg-green-100' },
    in_progress: { label: 'En Progreso', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    completed: { label: 'Completado', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    cancelled: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100' },
    no_show: { label: 'No Asistió', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  };
  return statusMap[status];
}

