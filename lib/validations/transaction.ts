/**
 * Transaction Validation Schemas
 */

import { z } from 'zod';

const uuidSchema = z.string().uuid('ID inválido');

export const transactionTypeSchema = z.enum([
  'payment',
  'refund',
  'deposit',
  'adjustment',
  'tip',
]);

export const transactionStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
]);

export const paymentMethodSchema = z.enum([
  'cash',
  'card',
  'transfer',
  'mercadopago',
  'other',
]);

/** Categoría de gasto (para type = adjustment). Se guarda en metadata. */
export const expenseCategorySchema = z.enum([
  'salary',
  'rent',
  'supplies',
  'utilities',
  'other',
]);

export const createTransactionSchema = z.object({
  business_id: uuidSchema,
  appointment_id: uuidSchema.optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  staff_id: uuidSchema.optional().nullable(),
  type: transactionTypeSchema,
  status: transactionStatusSchema.optional(),
  amount: z.coerce.number().int('El monto debe ser un número entero').gt(0, 'El monto debe ser mayor a 0'),
  currency: z.string().toUpperCase().trim().length(3).default('ARS'),
  payment_method: paymentMethodSchema,
  description: z.string().trim().max(500).optional().nullable(),
  reference: z.string().trim().max(100).optional().nullable(),
  expense_category: expenseCategorySchema.optional().nullable(),
});

export const updateTransactionSchema = z.object({
  appointment_id: uuidSchema.optional().nullable(),
  client_id: uuidSchema.optional().nullable(),
  staff_id: uuidSchema.optional().nullable(),
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  amount: z.coerce.number().int().gt(0).optional(),
  currency: z.string().toUpperCase().trim().length(3).optional(),
  payment_method: paymentMethodSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  reference: z.string().trim().max(100).optional().nullable(),
  expense_category: expenseCategorySchema.optional().nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
