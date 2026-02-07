'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/lib/utils';

type ServiceCategory = 'haircut' | 'beard' | 'coloring' | 'treatment' | 'styling' | 'combo' | 'other';
type ServiceStatus = 'active' | 'inactive' | 'archived';

type Business = {
  id: string;
  name: string;
};

type ApiService = {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  duration_minutes: number;
  price: number;
  status: ServiceStatus;
};

const categoryConfig: Record<ServiceCategory, { label: string; emoji: string; color: string }> = {
  haircut: { label: 'Corte', emoji: '💇‍♂️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  beard: { label: 'Barba', emoji: '🧔', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  coloring: { label: 'Color', emoji: '🎨', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  treatment: { label: 'Tratamiento', emoji: '💆‍♂️', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  styling: { label: 'Styling', emoji: '✨', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  combo: { label: 'Combo', emoji: '🧩', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  other: { label: 'Otro', emoji: '📦', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function ServicesPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [services, setServices] = React.useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<ServiceCategory | 'all'>('all');

  React.useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch('/api/businesses', { cache: 'no-store' });
        const json = (await res.json()) as { businesses?: Business[]; error?: string };

        if (!res.ok) {
          setErrorMessage(json.error ?? 'No se pudieron cargar los negocios');
          setIsLoading(false);
          return;
        }

        const fetchedBusinesses = json.businesses ?? [];
        setBusinesses(fetchedBusinesses);
        setSelectedBusinessId(fetchedBusinesses[0]?.id ?? '');
      } catch {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    const loadServices = async () => {
      if (!selectedBusinessId) {
        setServices([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/services?businessId=${selectedBusinessId}`, { cache: 'no-store' });
        const json = (await res.json()) as { services?: ApiService[]; error?: string };

        if (!res.ok) {
          setErrorMessage(json.error ?? 'No se pudieron cargar los servicios');
          setServices([]);
          return;
        }

        setServices(json.services ?? []);
      } catch {
        setErrorMessage('Error de conexión. Intenta nuevamente.');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadServices();
  }, [selectedBusinessId]);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status === 'active').length;
  const averagePrice = services.length > 0
    ? Math.round(services.reduce((acc, service) => acc + service.price, 0) / services.length)
    : 0;

  const categories = Object.entries(categoryConfig).map(([key, value]) => ({
    key: key as ServiceCategory,
    ...value,
    count: services.filter((service) => service.category === key).length,
  }));

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Servicios</h1>
          <p className="mt-1 text-surface-500">Datos consumidos desde `/api/services`.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-64">
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
          >
            {businesses.length === 0 ? (
              <option value="">Sin negocios</option>
            ) : (
              businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))
            )}
          </select>
        </div>

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Total Servicios</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : totalServices}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{isLoading ? '...' : activeServices}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Precio Promedio</p>
            <p className="mt-1 text-3xl font-bold text-accent-600">${(averagePrice / 100).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

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
          Todos ({totalServices})
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

      <Input
        placeholder="Buscar servicio..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} variant="elevated" className="card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30">
                <span className="text-5xl">{categoryConfig[service.category].emoji}</span>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-surface-50">{service.name}</h3>
                    <Badge className={cn('mt-1', categoryConfig[service.category].color)}>
                      {categoryConfig[service.category].label}
                    </Badge>
                  </div>
                  {service.status !== 'active' && <Badge variant="secondary">{service.status}</Badge>}
                </div>

                <p className="mt-3 text-sm text-surface-500 line-clamp-2">{service.description ?? 'Sin descripción'}</p>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-surface-500">
                    <HiOutlineClock className="h-4 w-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-primary-600">
                    <HiOutlineCurrencyDollar className="h-4 w-4" />
                    <span>${(service.price / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filteredServices.length === 0 && (
        <Card variant="elevated">
          <CardContent className="py-12 text-center">
            <p className="text-surface-500">No se encontraron servicios</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
