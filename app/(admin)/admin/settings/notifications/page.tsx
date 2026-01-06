'use client';

import * as React from 'react';
import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineBell, HiOutlineEnvelope, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'new_booking',
    title: 'Nueva Reserva',
    description: 'Cuando un cliente agenda una nueva cita',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'booking_cancelled',
    title: 'Reserva Cancelada',
    description: 'Cuando un cliente cancela una cita',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'booking_reminder',
    title: 'Recordatorio de Cita',
    description: 'Recordatorios antes de cada cita',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'daily_summary',
    title: 'Resumen Diario',
    description: 'Resumen de citas del día siguiente',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'weekly_report',
    title: 'Reporte Semanal',
    description: 'Métricas y rendimiento de la semana',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'new_review',
    title: 'Nueva Reseña',
    description: 'Cuando un cliente deja una reseña',
    email: true,
    push: true,
    sms: false,
  },
];

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = React.useState(defaultSettings);

  const toggleSetting = (id: string, channel: 'email' | 'push' | 'sms') => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
  };

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
            Notificaciones
          </h1>
          <p className="mt-1 text-surface-500">
            Configura cómo quieres recibir las alertas
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Canales de Notificación</CardTitle>
            <div className="flex items-center gap-6 text-sm font-medium text-surface-500">
              <div className="flex items-center gap-2">
                <HiOutlineEnvelope className="h-4 w-4" />
                Email
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineBell className="h-4 w-4" />
                Push
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineDevicePhoneMobile className="h-4 w-4" />
                SMS
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800"
              >
                <div>
                  <h3 className="font-medium text-surface-900 dark:text-surface-50">
                    {setting.title}
                  </h3>
                  <p className="text-sm text-surface-500">{setting.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  {(['email', 'push', 'sms'] as const).map((channel) => (
                    <button
                      key={channel}
                      onClick={() => toggleSetting(setting.id, channel)}
                      className={cn(
                        'flex h-6 w-12 items-center rounded-full p-1 transition-all',
                        setting[channel]
                          ? 'bg-primary-600'
                          : 'bg-surface-300 dark:bg-surface-700'
                      )}
                    >
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full bg-white transition-transform',
                          setting[channel] && 'translate-x-6'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recordatorios para Clientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800">
            <div>
              <h3 className="font-medium text-surface-900 dark:text-surface-50">
                Enviar recordatorios automáticos
              </h3>
              <p className="text-sm text-surface-500">
                Los clientes recibirán recordatorios antes de su cita
              </p>
            </div>
            <button className="flex h-6 w-12 items-center rounded-full bg-primary-600 p-1 transition-all">
              <div className="h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Tiempo de anticipación
            </label>
            <select className="mt-1 w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900">
              <option value="1">1 hora antes</option>
              <option value="2">2 horas antes</option>
              <option value="12">12 horas antes</option>
              <option value="24" selected>24 horas antes</option>
              <option value="48">48 horas antes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button variant="glow">Guardar Cambios</Button>
      </div>
    </div>
  );
}

