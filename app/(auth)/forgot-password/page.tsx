'use client';

import * as React from 'react';
import Link from 'next/link';
import { HiOutlineEnvelope, HiOutlineArrowLeft } from 'react-icons/hi2';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSent(true);
    setIsLoading(false);
  };

  if (isSent) {
    return (
      <div className="animate-in text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Revisa tu email
        </h2>
        <p className="mt-2 text-surface-500">
          Te enviamos un link para restablecer tu contraseña.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="outline">Volver a iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
        Recupera tu contraseña
      </h2>
      <p className="mt-2 text-surface-500">
        Ingresa tu email y te enviaremos un link para restablecerla.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Email
          </label>
          <Input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<HiOutlineEnvelope className="h-5 w-5" />}
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" variant="glow" isLoading={isLoading}>
          Enviar link
        </Button>
      </form>
    </div>
  );
}

