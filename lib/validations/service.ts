/**
 * Service Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

export const serviceCategorySchema = z.enum([
  'haircut',
  'beard',
  'coloring',
  'treatment',
  'styling',
  'combo',
  'other',
]);

const uuidSchema = z.string().uuid('ID inválido');

export const createServiceSchema = z.object({
  business_id: uuidSchema,
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform((val) => val.trim()),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  category: serviceCategorySchema,
  duration_minutes: z
    .coerce
    .number()
    .int('La duración debe ser un número entero')
    .gt(0, 'La duración debe ser mayor a 0 minutos'),
  price: z
    .coerce
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio excede el máximo permitido'),
  currency: z
    .string()
    .toUpperCase()
    .trim()
    .length(3, 'El código de moneda debe tener 3 caracteres')
    .default('ARS'),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  image_url: z.string().url('URL de imagen inválida').optional().nullable(),
  sort_order: z.coerce.number().int().min(0).optional(),
  requires_deposit: z.boolean().default(false),
  deposit_amount: z
    .coerce
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .gt(0, 'El depósito debe ser mayor a 0')
    .optional(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .transform((val) => val?.trim() ?? null),
  category: serviceCategorySchema.optional(),
  duration_minutes: z
    .coerce
    .number()
    .int('La duración debe ser un número entero')
    .gt(0, 'La duración debe ser mayor a 0 minutos')
    .optional(),
  price: z
    .coerce
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio excede el máximo permitido')
    .optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  image_url: z.string().url('URL de imagen inválida').optional().nullable(),
  sort_order: z.coerce.number().int().min(0).optional(),
  requires_deposit: z.boolean().optional(),
  deposit_amount: z
    .coerce
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .gt(0, 'El depósito debe ser mayor a 0')
    .optional(),
  currency: z
    .string()
    .toUpperCase()
    .trim()
    .length(3, 'El código de moneda debe tener 3 caracteres')
    .optional(),
});

// Types
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
