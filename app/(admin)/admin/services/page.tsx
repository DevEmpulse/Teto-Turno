'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineBanknotes,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { Modal } from '@/presentation/components/ui/modal';
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
  currency?: string;
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

const CATEGORIES = Object.keys(categoryConfig) as ServiceCategory[];
const STATUS_OPTIONS: { value: ServiceStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'archived', label: 'Archivado' },
];

export default function ServicesPage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [services, setServices] = React.useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<ServiceCategory | 'all'>('all');

  const [modalOpen, setModalOpen] = React.useState<'create' | 'edit' | 'delete' | null>(null);
  const [editingService, setEditingService] = React.useState<ApiService | null>(null);
  const [deletingService, setDeletingService] = React.useState<ApiService | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: 'other' as ServiceCategory,
    duration_minutes: 30,
    price: '',
    status: 'active' as ServiceStatus,
  });

  const loadServices = React.useCallback(async () => {
    if (!selectedBusinessId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/services?businessId=${selectedBusinessId}`, { cache: 'no-store' });
      const json = (await res.json()) as { services?: ApiService[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
      setServices(json.services ?? []);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusinessId]);

  React.useEffect(() => {
    const loadBusinesses = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/businesses', { cache: 'no-store' });
        const json = (await res.json()) as { businesses?: Business[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
        const fetched = json.businesses ?? [];
        setBusinesses(fetched);
        setSelectedBusinessId(fetched[0]?.id ?? '');
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      } finally {
        setIsLoading(false);
      }
    };
    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    if (selectedBusinessId) void loadServices();
    else setServices([]);
  }, [selectedBusinessId, loadServices]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'other',
      duration_minutes: 30,
      price: '',
      status: 'active',
    });
    setFormError(null);
    setEditingService(null);
    setDeletingService(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen('create');
  };

  const openEdit = (service: ApiService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description ?? '',
      category: service.category,
      duration_minutes: service.duration_minutes,
      price: String(service.price / 100),
      status: service.status,
    });
    setFormError(null);
    setModalOpen('edit');
  };

  const openDelete = (service: ApiService) => {
    setDeletingService(service);
    setModalOpen('delete');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const priceStr = formData.price.replace(/[^\d.]/g, '');
    const pricePesos = parseFloat(priceStr) || 0;
    const priceCentavos = Math.round(pricePesos * 100);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: selectedBusinessId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          duration_minutes: formData.duration_minutes,
          price: priceCentavos,
          currency: 'ARS',
          status: formData.status,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al crear');
      setSuccessMessage('Servicio creado correctamente');
      setModalOpen(null);
      resetForm();
      void loadServices();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setFormError(null);
    setIsSubmitting(true);
    const priceStr = formData.price.replace(/[^\d.]/g, '');
    const pricePesos = parseFloat(priceStr) || 0;
    const priceCentavos = Math.round(pricePesos * 100);
    try {
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          duration_minutes: formData.duration_minutes,
          price: priceCentavos,
          status: formData.status,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al actualizar');
      setSuccessMessage('Servicio actualizado correctamente');
      setModalOpen(null);
      resetForm();
      void loadServices();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/services/${deletingService.id}`, { method: 'DELETE' });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al eliminar');
      setSuccessMessage('Servicio eliminado correctamente');
      setModalOpen(null);
      resetForm();
      void loadServices();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.status === 'active').length;
  const averagePrice =
    services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length) : 0;

  const categories = Object.entries(categoryConfig).map(([key, value]) => ({
    key: key as ServiceCategory,
    ...value,
    count: services.filter((s) => s.category === key).length,
  }));

  React.useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Servicios</h1>
          <p className="mt-1 text-surface-500">Gestiona los servicios de tu negocio.</p>
        </div>
        <Button onClick={openCreate} variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
          Crear servicio
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/50">
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-64">
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
          >
            {businesses.length === 0 ? (
              <option value="">Sin negocios</option>
            ) : (
              businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/staff"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineUserGroup className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
          <Link
            href="/admin/finance"
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
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
            'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all',
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
              'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all',
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
                <p className="mt-3 text-sm text-surface-500 line-clamp-2">
                  {service.description ?? 'Sin descripción'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-surface-500">
                      <HiOutlineClock className="h-4 w-4" />
                      {service.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-primary-600">
                      <HiOutlineCurrencyDollar className="h-4 w-4" />
                      ${(service.price / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(service)}
                      aria-label="Editar"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:text-red-400"
                      onClick={() => openDelete(service)}
                      aria-label="Eliminar"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </Button>
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
            <Button className="mt-4" variant="outline" onClick={openCreate}>
              Crear primer servicio
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={modalOpen === 'create' || modalOpen === 'edit'}
        onClose={() => {
          setModalOpen(null);
          resetForm();
        }}
        title={modalOpen === 'create' ? 'Crear servicio' : 'Editar servicio'}
      >
        <form onSubmit={modalOpen === 'create' ? handleCreate : handleEdit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
              {formError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Nombre *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Corte + Barba"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descripción opcional"
              rows={2}
              className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Categoría *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value as ServiceCategory }))}
              className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Duración (min) *
              </label>
              <Input
                type="number"
                required
                min={5}
                max={480}
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, duration_minutes: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Precio (ARS) *
              </label>
              <Input
                required
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                placeholder="3500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as ServiceStatus }))}
              className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="glow" isLoading={isSubmitting}>
              {modalOpen === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen === 'delete'}
        onClose={() => {
          setModalOpen(null);
          setDeletingService(null);
        }}
        title="Eliminar servicio"
      >
        {deletingService && (
          <div className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <p className="text-surface-600 dark:text-surface-400">
              ¿Estás seguro de que deseas eliminar el servicio <strong>{deletingService.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} isLoading={isSubmitting}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
