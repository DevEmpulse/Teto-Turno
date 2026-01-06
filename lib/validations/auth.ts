/**
 * Authentication Validation Schemas
 * OWASP ASVS compliant input validation
 */

import { z } from 'zod';

// Common patterns for security
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Email validation with security considerations
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .max(254, 'El email es demasiado largo')
  .regex(EMAIL_REGEX, 'Formato de email inválido')
  .transform((email) => email.toLowerCase().trim());

// Password validation following OWASP guidelines
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(PASSWORD_MAX_LENGTH, `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`)
  .refine(
    (password) => /[A-Z]/.test(password),
    'La contraseña debe contener al menos una letra mayúscula'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'La contraseña debe contener al menos una letra minúscula'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'La contraseña debe contener al menos un número'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'La contraseña debe contener al menos un carácter especial'
  );

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Registration schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder 50 caracteres')
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
    phone: z
      .string()
      .optional()
      .refine(
        (phone) => !phone || /^\+?[1-9]\d{6,14}$/.test(phone.replace(/\s/g, '')),
        'Formato de teléfono inválido'
      ),
    acceptTerms: z.literal(true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    token: z.string().min(1, 'Token inválido'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

