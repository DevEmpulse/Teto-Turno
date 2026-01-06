/**
 * Appointment Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

// UUID validation for IDs
const uuidSchema = z.string().uuid('ID inválido');

// Date validation (must be in the future for booking)
const futureDateSchema = z
  .date()
  .refine(
    (date) => date > new Date(),
    'La fecha debe ser en el futuro'
  );

// Create appointment schema
export const createAppointmentSchema = z.object({
  serviceId: uuidSchema,
  staffId: uuidSchema,
  scheduledAt: z.coerce.date().refine(
    (date) => date > new Date(),
    'La fecha de la cita debe ser en el futuro'
  ),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .transform((val) => val?.trim()),
});

// Update appointment schema
export const updateAppointmentSchema = z.object({
  staffId: uuidSchema.optional(),
  scheduledAt: futureDateSchema.optional(),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .transform((val) => val?.trim()),
  internalNotes: z
    .string()
    .max(1000, 'Las notas internas no pueden exceder 1000 caracteres')
    .optional()
    .transform((val) => val?.trim()),
});

// Cancel appointment schema
export const cancelAppointmentSchema = z.object({
  appointmentId: uuidSchema,
  reason: z.enum([
    'client_request',
    'staff_unavailable',
    'business_closed',
    'schedule_conflict',
    'other',
  ]),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

// Reschedule appointment schema
export const rescheduleAppointmentSchema = z.object({
  appointmentId: uuidSchema,
  newScheduledAt: futureDateSchema,
  staffId: uuidSchema.optional(),
});

// Appointment filters schema (for queries)
export const appointmentFiltersSchema = z.object({
  businessId: uuidSchema.optional(),
  clientId: uuidSchema.optional(),
  staffId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  status: z
    .enum([
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show',
    ])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Types
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type AppointmentFiltersInput = z.infer<typeof appointmentFiltersSchema>;

