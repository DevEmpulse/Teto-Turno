'use client';

import * as React from 'react';
import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineSwatch, HiOutlinePhoto } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

const colorPresets = [
  { name: 'Violeta', primary: '#8b5cf6', accent: '#06b6d4' },
  { name: 'Azul', primary: '#3b82f6', accent: '#10b981' },
  { name: 'Verde', primary: '#10b981', accent: '#f59e0b' },
  { name: 'Rosa', primary: '#ec4899', accent: '#8b5cf6' },
  { name: 'Naranja', primary: '#f97316', accent: '#06b6d4' },
  { name: 'Rojo', primary: '#ef4444', accent: '#f97316' },
];

export default function AppearanceSettingsPage() {
  const [selectedColor, setSelectedColor] = React.useState(colorPresets[0]);

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
            Apariencia
          </h1>
          <p className="mt-1 text-surface-500">
            Personaliza la página de reservas de tu negocio
          </p>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlinePhoto className="h-5 w-5" />
            Logo y Portada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Logo del Negocio
            </label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-2xl font-bold text-white">
                B
              </div>
              <div>
                <Button variant="outline" size="sm">Subir Logo</Button>
                <p className="mt-1 text-xs text-surface-500">
                  PNG, JPG hasta 2MB. Recomendado: 200x200px
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Imagen de Portada
            </label>
            <div className="mt-2 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-surface-300 bg-surface-50 dark:border-surface-700 dark:bg-surface-900">
              <div className="text-center">
                <HiOutlinePhoto className="mx-auto h-8 w-8 text-surface-400" />
                <p className="mt-2 text-sm text-surface-500">
                  Arrastra una imagen o haz clic para subir
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineSwatch className="h-5 w-5" />
            Colores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Tema de Color
            </label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedColor(preset)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                    selectedColor?.name === preset.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 hover:border-surface-300 dark:border-surface-700'
                  )}
                >
                  <div className="flex gap-1">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Color Primario
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={selectedColor?.primary}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-surface-300 dark:border-surface-700"
                />
                <Input value={selectedColor?.primary} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Color Secundario
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={selectedColor?.accent}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-surface-300 dark:border-surface-700"
                />
                <Input value={selectedColor?.accent} className="flex-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="gradient">
        <CardContent className="py-6">
          <h3 className="font-semibold text-surface-900 dark:text-surface-50">
            Vista Previa
          </h3>
          <p className="mt-1 text-sm text-surface-500">
            Así se verá tu página de reservas para los clientes
          </p>
          <Button variant="outline" className="mt-4">
            Ver Vista Previa
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button variant="glow">Guardar Cambios</Button>
      </div>
    </div>
  );
}

