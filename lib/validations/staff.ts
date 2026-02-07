/**
 * Staff Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

const uuidSchema = z.string().uuid('ID inválido');
const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido');

export const staffRoleSchema = z.enum(['staff', 'admin', 'owner']);

export const createStaffSchema = z.object({
  user_id: uuidSchema,
  business_id: uuidSchema,
  role: staffRoleSchema.default('staff'),
  title: z
    .string()
    .trim()
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  bio: z
    .string()
    .trim()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  break_duration_minutes: z
    .coerce
    .number()
    .int()
    .min(0, 'El tiempo de descanso no puede ser negativo')
    .max(120, 'El tiempo de descanso máximo es 120 minutos')
    .optional(),
  max_daily_appointments: z
    .coerce
    .number()
    .int()
    .min(1, 'El mínimo de citas diarias es 1')
    .max(50, 'El máximo de citas diarias es 50')
    .optional()
    .nullable(),
  color: hexColorSchema.default('#8b5cf6'),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export const updateStaffSchema = z.object({
  role: staffRoleSchema.optional(),
  title: z
    .string()
    .trim()
    .max(100, 'El título no puede exceder 100 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  bio: z
    .string()
    .trim()
    .max(500, 'La biografía no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  break_duration_minutes: z
    .coerce
    .number()
    .int()
    .min(0, 'El tiempo de descanso no puede ser negativo')
    .max(120, 'El tiempo de descanso máximo es 120 minutos')
    .optional(),
  max_daily_appointments: z
    .coerce
    .number()
    .int()
    .min(1, 'El mínimo de citas diarias es 1')
    .max(50, 'El máximo de citas diarias es 50')
    .optional()
    .nullable(),
  color: hexColorSchema.optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export const assignServicesSchema = z.object({
  staff_id: uuidSchema,
  service_ids: z.array(uuidSchema),
});

// Types
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type AssignServicesInput = z.infer<typeof assignServicesSchema>;
export type StaffRoleInput = z.infer<typeof staffRoleSchema>;
