'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Avatar } from '@/presentation/components/ui/avatar';

export default function ProfileSettingsPage() {
  return (
    <div className="animate-in max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
          Perfil
        </h1>
        <p className="mt-1 text-surface-500">
          Administra tu información personal
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name="Admin User" size="xl" />
            <Button variant="outline">Cambiar foto</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Nombre
              </label>
              <Input defaultValue="Admin" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Apellido
              </label>
              <Input defaultValue="User" className="mt-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Email
            </label>
            <Input type="email" defaultValue="admin@teto.app" className="mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Teléfono
            </label>
            <Input type="tel" placeholder="+54 11 1234 5678" className="mt-1" />
          </div>

          <Button variant="glow">Guardar cambios</Button>
        </CardContent>
      </Card>
    </div>
  );
}

