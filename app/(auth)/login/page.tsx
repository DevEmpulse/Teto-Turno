'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(result.error ?? 'No se pudo iniciar sesión');
        return;
      }

      router.push('/admin');
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-accent-500">
          <span className="text-xl font-bold text-white">T</span>
        </div>
        <span className="text-2xl font-bold text-surface-900 dark:text-surface-50">Teto</span>
      </div>

      {/* Header */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          Bienvenido de vuelta
        </h2>
        <p className="mt-2 text-surface-500">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Regístrate gratis
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<HiOutlineEnvelope className="h-5 w-5" />}
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
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-surface-700 dark:text-surface-300"
            >
              Recordarme
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          variant="glow"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Iniciar Sesión
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200 dark:border-surface-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-surface-500 dark:bg-surface-950">
              O continúa con
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
