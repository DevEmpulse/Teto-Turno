/**
 * Staff Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

// Time format validation (HH:mm)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)');

// Time slot schema
const timeSlotSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine(
    (slot) => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
      const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
      return endMinutes > startMinutes;
    },
    { message: 'La hora de fin debe ser posterior a la hora de inicio' }
  );

// Working hours schema
const workingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isWorking: z.boolean(),
  slots: z.array(timeSlotSchema),
});

// Hex color validation
const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color hexadecimal inválido');

// Create staff schema
export const createStaffSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  title: z
    .string()
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional()
    .transform((val) => val?.trim()),
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional()
    .transform((val) => val?.trim()),
  workingHours: z.array(workingHoursSchema).length(7).optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
  breakDurationMinutes: z
    .number()
    .int()
    .min(0, 'El tiempo de descanso no puede ser negativo')
    .max(60, 'El tiempo de descanso máximo es 60 minutos')
    .default(0),
  color: hexColorSchema.default('#8b5cf6'),
});

// Update staff schema
export const updateStaffSchema = z.object({
  title: z
    .string()
    .max(100, 'El título no puede exceder 100 caracteres')
    .transform((val) => val.trim())
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .transform((val) => val.trim())
    .optional()
    .nullable(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  workingHours: z.array(workingHoursSchema).length(7).optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
  breakDurationMinutes: z
    .number()
    .int()
    .min(0, 'El tiempo de descanso no puede ser negativo')
    .max(60, 'El tiempo de descanso máximo es 60 minutos')
    .optional(),
  maxDailyAppointments: z
    .number()
    .int()
    .min(1, 'El mínimo de citas diarias es 1')
    .max(50, 'El máximo de citas diarias es 50')
    .optional()
    .nullable(),
  color: hexColorSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Assign services schema
export const assignServicesSchema = z.object({
  staffId: z.string().uuid('ID de staff inválido'),
  serviceIds: z.array(z.string().uuid('ID de servicio inválido')),
});

// Types
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type AssignServicesInput = z.infer<typeof assignServicesSchema>;
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;
export type TimeSlotInput = z.infer<typeof timeSlotSchema>;

