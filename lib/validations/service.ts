/**
 * Service Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

// Service categories
const serviceCategorySchema = z.enum([
  'haircut',
  'beard',
  'coloring',
  'treatment',
  'styling',
  'combo',
  'other',
]);

// Create service schema
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .transform((val) => val?.trim()),
  category: serviceCategorySchema,
  durationMinutes: z
    .number()
    .int('La duración debe ser un número entero')
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 8 horas'),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio excede el máximo permitido'), // Max ~$100,000
  currency: z
    .string()
    .length(3, 'El código de moneda debe tener 3 caracteres')
    .default('ARS'),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .min(0, 'El depósito no puede ser negativo')
    .optional(),
});

// Update service schema
export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .transform((val) => val.trim())
    .optional()
    .nullable(),
  category: serviceCategorySchema.optional(),
  durationMinutes: z
    .number()
    .int('La duración debe ser un número entero')
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 8 horas')
    .optional(),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .min(0, 'El precio no puede ser negativo')
    .max(10000000, 'El precio excede el máximo permitido')
    .optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  sortOrder: z.number().int().min(0).optional(),
  requiresDeposit: z.boolean().optional(),
  depositAmount: z
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .min(0, 'El depósito no puede ser negativo')
    .optional(),
});

// Types
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;

