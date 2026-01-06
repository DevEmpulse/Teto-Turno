'use client';

import * as React from 'react';
import { HiOutlineArrowLeft, HiOutlineMapPin, HiOutlineClock } from 'react-icons/hi2';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function BusinessSettingsPage() {
  const [businessHours, setBusinessHours] = React.useState(
    dayNames.map((_, i) => ({
      dayOfWeek: i,
      isOpen: i >= 1 && i <= 6,
      openTime: '09:00',
      closeTime: '19:00',
    }))
  );

  const toggleDay = (dayIndex: number) => {
    setBusinessHours((prev) =>
      prev.map((day, i) =>
        i === dayIndex ? { ...day, isOpen: !day.isOpen } : day
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
            Información del Negocio
          </h1>
          <p className="mt-1 text-surface-500">
            Configura los datos de tu negocio
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Nombre del Negocio
            </label>
            <Input defaultValue="Barbería Premium" className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Descripción
            </label>
            <textarea
              defaultValue="La mejor barbería de la ciudad con más de 10 años de experiencia."
              rows={3}
              className="mt-1 w-full rounded-xl border border-surface-300 px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Teléfono
              </label>
              <Input defaultValue="+54 11 1234 5678" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Email
              </label>
              <Input type="email" defaultValue="contacto@barberia.com" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Sitio Web
            </label>
            <Input defaultValue="https://barberiapremium.com" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineMapPin className="h-5 w-5" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Dirección
            </label>
            <Input defaultValue="Av. Corrientes 1234" className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Ciudad
              </label>
              <Input defaultValue="Buenos Aires" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Provincia
              </label>
              <Input defaultValue="CABA" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Código Postal
              </label>
              <Input defaultValue="C1043" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineClock className="h-5 w-5" />
            Horarios de Atención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {businessHours.map((day, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-800"
              >
                <button
                  onClick={() => toggleDay(index)}
                  className={cn(
                    'flex h-6 w-12 items-center rounded-full p-1 transition-all',
                    day.isOpen ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'
                  )}
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full bg-white transition-transform',
                      day.isOpen && 'translate-x-6'
                    )}
                  />
                </button>
                <span className="w-24 font-medium text-surface-900 dark:text-surface-50">
                  {dayNames[index]}
                </span>
                {day.isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.openTime}
                      onChange={(e) =>
                        setBusinessHours((prev) =>
                          prev.map((d, i) =>
                            i === index ? { ...d, openTime: e.target.value } : d
                          )
                        )
                      }
                      className="rounded-lg border border-surface-300 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-900"
                    />
                    <span className="text-surface-500">a</span>
                    <input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) =>
                        setBusinessHours((prev) =>
                          prev.map((d, i) =>
                            i === index ? { ...d, closeTime: e.target.value } : d
                          )
                        )
                      }
                      className="rounded-lg border border-surface-300 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-900"
                    />
                  </div>
                ) : (
                  <span className="text-surface-500">Cerrado</span>
                )}
              </div>
            ))}
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

