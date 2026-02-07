'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlinePhone,
} from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(result.error ?? 'No se pudo crear la cuenta');
        return;
      }

      setSuccessMessage('Cuenta creada. Revisa tu email para confirmar');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      });
    } catch {
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
          <span className="text-xl font-bold text-white">T</span>
        </div>
        <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Teto
        </span>
      </div>

      {/* Header */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-surface-500">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Inicia sesión
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Nombre
            </label>
            <div className="mt-1">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                leftIcon={<HiOutlineUser className="h-5 w-5" />}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-surface-700 dark:text-surface-300"
            >
              Apellido
            </label>
            <div className="mt-1">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            Email
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              leftIcon={<HiOutlineEnvelope className="h-5 w-5" />}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            Teléfono (opcional)
          </label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+54 11 1234 5678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              leftIcon={<HiOutlinePhone className="h-5 w-5" />}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            Contraseña
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              leftIcon={<HiOutlineLockClosed className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-surface-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              }
            />
          </div>
          <p className="mt-1.5 text-xs text-surface-500">
            Debe contener mayúsculas, minúsculas, números y caracteres especiales
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            Confirmar Contraseña
          </label>
          <div className="mt-1">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              leftIcon={<HiOutlineLockClosed className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={(e) =>
              setFormData({ ...formData, acceptTerms: e.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="accept-terms"
            className="ml-2 block text-sm text-surface-700 dark:text-surface-300"
          >
            Acepto los{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500">
              Términos de Servicio
            </Link>{' '}
            y la{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
              Política de Privacidad
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          variant="glow"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Crear Cuenta
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200 dark:border-surface-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-surface-500 dark:bg-surface-950">
              O regístrate con
            </span>
          </div>
        </div>

        {/* Social login */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          leftIcon={<FcGoogle className="h-5 w-5" />}
        >
          Google
        </Button>
      </form>
    </div>
  );
}
