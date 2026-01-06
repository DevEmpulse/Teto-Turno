'use client';

import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineKey, HiOutlineShieldCheck, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';

export default function SecuritySettingsPage() {
  return (
    <div className="animate-in max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Seguridad
          </h1>
          <p className="mt-1 text-surface-500">
            Protege tu cuenta y datos
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineKey className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Contraseña Actual
            </label>
            <Input type="password" placeholder="••••••••" className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Nueva Contraseña
            </label>
            <Input type="password" placeholder="Mínimo 8 caracteres" className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Confirmar Nueva Contraseña
            </label>
            <Input type="password" placeholder="Repite la nueva contraseña" className="mt-1" />
          </div>
          <Button variant="outline">Actualizar Contraseña</Button>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HiOutlineShieldCheck className="h-5 w-5" />
              Autenticación de Dos Factores
            </CardTitle>
            <Badge variant="secondary">Desactivado</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-surface-500">
            Añade una capa extra de seguridad a tu cuenta requiriendo un código
            adicional al iniciar sesión.
          </p>
          <Button variant="outline" className="mt-4">
            Activar 2FA
          </Button>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineDevicePhoneMobile className="h-5 w-5" />
            Sesiones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    Chrome en MacOS
                  </p>
                  <Badge variant="success" size="sm">Actual</Badge>
                </div>
                <p className="text-sm text-surface-500">
                  Buenos Aires, Argentina • Activa ahora
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50">
                  Safari en iPhone
                </p>
                <p className="text-sm text-surface-500">
                  Buenos Aires, Argentina • Hace 2 días
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600">
                Cerrar
              </Button>
            </div>
          </div>
          <Button variant="outline" className="mt-4 text-red-600 hover:bg-red-50">
            Cerrar todas las otras sesiones
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

