'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/lib/utils';

// Category tabs
const categoryTabs = [
  { id: 'all', label: 'Todos' },
  { id: 'haircut', label: 'Cortes' },
  { id: 'beard', label: 'Barba' },
  { id: 'coloring', label: 'Color' },
  { id: 'treatment', label: 'Tratamientos' },
  { id: 'combo', label: 'Combos' },
];

type ServiceCategory = 'haircut' | 'beard' | 'coloring' | 'treatment' | 'combo' | 'other';
type ServiceStatus = 'active' | 'inactive';

interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  duration: number;
  price: number;
  status: ServiceStatus;
  image?: string;
  staffCount: number;
  bookingsThisMonth: number;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con tijera y máquina',
    category: 'haircut',
    duration: 30,
    price: 2500,
    status: 'active',
    staffCount: 3,
    bookingsThisMonth: 45,
  },
  {
    id: '2',
    name: 'Corte + Barba',
    description: 'Combo de corte de pelo y arreglo de barba completo',
    category: 'combo',
    duration: 45,
    price: 3500,
    status: 'active',
    staffCount: 3,
    bookingsThisMonth: 38,
  },
  {
    id: '3',
    name: 'Barba Completa',
    description: 'Perfilado, afeitado y tratamiento con toalla caliente',
    category: 'beard',
    duration: 25,
    price: 1800,
    status: 'active',
    staffCount: 3,
    bookingsThisMonth: 28,
  },
  {
    id: '4',
    name: 'Degradado / Fade',
    description: 'Corte degradado moderno con diseño personalizado',
    category: 'haircut',
    duration: 40,
    price: 3000,
    status: 'active',
    staffCount: 2,
    bookingsThisMonth: 52,
  },
  {
    id: '5',
    name: 'Coloración',
    description: 'Tinte completo o mechas con productos premium',
    category: 'coloring',
    duration: 90,
    price: 5500,
    status: 'active',
    staffCount: 1,
    bookingsThisMonth: 15,
  },
  {
    id: '6',
    name: 'Tratamiento Capilar',
    description: 'Hidratación profunda con masaje relajante',
    category: 'treatment',
    duration: 45,
    price: 2800,
    status: 'active',
    staffCount: 2,
    bookingsThisMonth: 22,
  },
  {
    id: '7',
    name: 'Corte Niño',
    description: 'Corte para menores de 12 años',
    category: 'haircut',
    duration: 20,
    price: 1500,
    status: 'inactive',
    staffCount: 2,
    bookingsThisMonth: 0,
  },
];

const categoryConfig: Record<ServiceCategory, { label: string; emoji: string; color: string }> = {
  haircut: { label: 'Corte', emoji: '💇‍♂️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  beard: { label: 'Barba', emoji: '🧔', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  coloring: { label: 'Color', emoji: '🎨', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  treatment: { label: 'Tratamiento', emoji: '💆‍♂️', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  combo: { label: 'Combo', emoji: '✨', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  other: { label: 'Otro', emoji: '📦', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<ServiceCategory | 'all'>('all');

  const filteredServices = mockServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalRevenue = mockServices.reduce(
    (sum, s) => sum + s.price * s.bookingsThisMonth,
    0
  );

  const categories = Object.entries(categoryConfig).map(([key, value]) => ({
    key: key as ServiceCategory,
    ...value,
    count: mockServices.filter((s) => s.category === key).length,
  }));

  return (
    <div className="animate-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Servicios
          </h1>
          <p className="mt-1 text-surface-500">
            Configura los servicios que ofrece tu negocio
          </p>
        </div>
        <Button variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
          Agregar Servicio
        </Button>
      </div>

      {/* Navigation Tabs and Links */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as ServiceCategory | 'all')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                selectedCategory === tab.id
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Related section links */}
        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/staff"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineUserGroup className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
          <Link
            href="/admin/finance"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineBanknotes className="h-4 w-4" />
            <span className="hidden sm:inline">Finanzas</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Total Servicios</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {mockServices.length}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {mockServices.filter((s) => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Reservas Este Mes</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">
              {mockServices.reduce((sum, s) => sum + s.bookingsThisMonth, 0)}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Ingresos Generados</p>
            <p className="mt-1 text-3xl font-bold text-accent-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all',
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
          )}
        >
          Todos ({mockServices.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              selectedCategory === cat.key
                ? 'bg-primary-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
            )}
          >
            {cat.emoji} {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar servicio..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            variant="elevated"
            className={cn(
              'card-hover overflow-hidden',
              service.status === 'inactive' && 'opacity-60'
            )}
          >
            <CardContent className="p-0">
              {/* Service image/emoji */}
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30">
                <span className="text-5xl">{categoryConfig[service.category].emoji}</span>
              </div>

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">
                      {service.name}
                    </h3>
                    <Badge className={cn('mt-1', categoryConfig[service.category].color)}>
                      {categoryConfig[service.category].label}
                    </Badge>
                  </div>
                  {service.status === 'inactive' && (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-sm text-surface-500 line-clamp-2">
                  {service.description}
                </p>

                {/* Details */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-surface-500">
                    <HiOutlineClock className="h-4 w-4" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-primary-600">
                    <HiOutlineCurrencyDollar className="h-4 w-4" />
                    <span>${service.price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between border-t border-surface-200 pt-4 dark:border-surface-800">
                  <div className="text-sm">
                    <span className="text-surface-500">Profesionales: </span>
                    <span className="font-medium text-surface-900 dark:text-surface-50">
                      {service.staffCount}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-surface-500">Reservas: </span>
                    <span className="font-medium text-surface-900 dark:text-surface-50">
                      {service.bookingsThisMonth}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <HiOutlinePencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    {service.status === 'active' ? (
                      <HiOutlineEyeSlash className="h-4 w-4" />
                    ) : (
                      <HiOutlineEye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-red-600">
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card variant="elevated">
          <CardContent className="py-12 text-center">
            <p className="text-surface-500">No se encontraron servicios</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

