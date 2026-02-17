'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HiOutlineCalendarDays,
  HiOutlineScissors,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Avatar } from '@/presentation/components/ui/avatar';
import { Button } from '@/presentation/components/ui/button';
import { Modal } from '@/presentation/components/ui/modal';
import { Input } from '@/presentation/components/ui/input';
import { cn } from '@/lib/utils';

const staffTabs = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
  { id: 'on_leave', label: 'En Licencia' },
] as const;

type StaffStatus = 'active' | 'inactive' | 'on_leave';

type Business = {
  id: string;
  name: string;
};

type StaffMember = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  status: StaffStatus;
  color: string;
};

type UserSearchResult = {
  id: string;
  email: string;
  full_name: string;
};

const statusConfig: Record<StaffStatus, { label: string; variant: 'success' | 'secondary' | 'warning' }> = {
  active: { label: 'Activo', variant: 'success' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
  on_leave: { label: 'De licencia', variant: 'warning' },
};

const STATUS_OPTIONS: { value: StaffStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'on_leave', label: 'En licencia' },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function StaffPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof staffTabs)[number]['id']>('all');
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState<'create' | 'edit' | 'delete' | null>(null);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = React.useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    user_id: '',
    user_display: '',
    title: '',
    status: 'active' as StaffStatus,
    color: '#8b5cf6',
  });
  const [userSearchResults, setUserSearchResults] = React.useState<UserSearchResult[]>([]);

  const loadStaff = React.useCallback(async () => {
    if (!selectedBusinessId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/staff?businessId=${selectedBusinessId}`, { cache: 'no-store' });
      const json = (await res.json()) as { staff?: StaffMember[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
      setStaff(json.staff ?? []);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      setStaff([]);
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
    if (selectedBusinessId) void loadStaff();
    else setStaff([]);
  }, [selectedBusinessId, loadStaff]);

  const searchUsers = React.useCallback(async (email: string) => {
    if (email.length < 3) {
      setUserSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      const json = (await res.json()) as { users?: UserSearchResult[]; error?: string };
      setUserSearchResults(json.users ?? []);
    } catch {
      setUserSearchResults([]);
    }
  }, []);

  const resetForm = () => {
    setFormData({
      email: '',
      user_id: '',
      user_display: '',
      title: '',
      status: 'active',
      color: '#8b5cf6',
    });
    setFormError(null);
    setEditingStaff(null);
    setDeletingStaff(null);
    setUserSearchResults([]);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen('create');
  };

  const openEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      email: member.email,
      user_id: member.user_id,
      user_display: member.full_name,
      title: member.title ?? '',
      status: member.status,
      color: member.color,
    });
    setFormError(null);
    setModalOpen('edit');
  };

  const openDelete = (member: StaffMember) => {
    setDeletingStaff(member);
    setModalOpen('delete');
  };

  const selectUser = (u: UserSearchResult) => {
    setFormData((p) => ({
      ...p,
      user_id: u.id,
      user_display: u.full_name || u.email,
      email: u.email,
    }));
    setUserSearchResults([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !selectedBusinessId) {
      setFormError('Debes buscar y seleccionar un usuario por email.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: formData.user_id,
          business_id: selectedBusinessId,
          title: formData.title.trim() || null,
          status: formData.status,
          color: formData.color,
          role: 'staff',
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al crear');
      setSuccessMessage('Personal agregado correctamente');
      setModalOpen(null);
      resetForm();
      void loadStaff();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/staff/${editingStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim() || null,
          status: formData.status,
          color: formData.color,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al actualizar');
      setSuccessMessage('Personal actualizado correctamente');
      setModalOpen(null);
      resetForm();
      void loadStaff();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/staff/${deletingStaff.id}`, { method: 'DELETE' });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al eliminar');
      setSuccessMessage('Personal eliminado correctamente');
      setModalOpen(null);
      resetForm();
      void loadStaff();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = activeTab === 'all' ? staff : staff.filter((p) => p.status === activeTab);
  const activeStaff = staff.filter((p) => p.status === 'active').length;

  React.useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Personal</h1>
          <p className="mt-1 text-surface-500">Gestiona el personal de tu negocio.</p>
        </div>
        <Button onClick={openCreate} variant="glow" leftIcon={<HiOutlinePlus className="h-5 w-5" />}>
          Agregar personal
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
        <div className="flex gap-2 overflow-x-auto pb-2">
          {staffTabs.map((tab) => (
            <button
              key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'cursor-pointer',
                'rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/calendar"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineCalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Ver Horarios</span>
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineScissors className="h-4 w-4" />
            <span className="hidden sm:inline">Servicios</span>
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-600 transition-all hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <HiOutlineChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Reportes</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Total Profesionales</p>
            <p className="mt-1 text-3xl font-bold text-surface-900 dark:text-surface-50">
              {isLoading ? '...' : staff.length}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">Activos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{isLoading ? '...' : activeStaff}</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <p className="text-sm text-surface-500">En filtro actual</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">{isLoading ? '...' : filteredStaff.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredStaff.map((person) => (
          <Card key={person.id} variant="elevated" className="card-hover overflow-hidden">
            <CardContent className="p-0">
              <div className="h-2" style={{ backgroundColor: person.color }} />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={person.full_name} size="lg" />
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-50">{person.full_name}</h3>
                      <p className="text-sm text-primary-600">{person.title ?? 'Sin título'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={statusConfig[person.status].variant}>{statusConfig[person.status].label}</Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(person)}
                      aria-label="Editar"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:text-red-400"
                      onClick={() => openDelete(person)}
                      aria-label="Eliminar"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm text-surface-500">
                  <p>{person.email}</p>
                  {person.phone && <p>{person.phone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filteredStaff.length === 0 && (
        <Card variant="elevated">
          <CardContent className="py-12 text-center">
            <p className="text-surface-500">No hay personal para mostrar</p>
            <Button className="mt-4" variant="outline" onClick={openCreate}>
              Agregar primer profesional
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
        title={modalOpen === 'create' ? 'Agregar personal' : 'Editar personal'}
      >
        <form onSubmit={modalOpen === 'create' ? handleCreate : handleEdit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
              {formError}
            </div>
          )}
          {modalOpen === 'create' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Buscar usuario por email *
              </label>
              <div className="relative">
                <Input
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, email: e.target.value, user_id: '', user_display: '' }));
                    void searchUsers(e.target.value);
                  }}
                  onBlur={() => setTimeout(() => setUserSearchResults([]), 200)}
                  placeholder="usuario@ejemplo.com"
                />
                {userSearchResults.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-xl border border-surface-200 bg-white py-1 shadow-lg dark:border-surface-700 dark:bg-surface-900">
                    {userSearchResults.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => selectUser(u)}
                          className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                          {u.full_name || u.email} ({u.email})
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {formData.user_display && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Seleccionado: {formData.user_display}
                  </p>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Título / Cargo
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ej: Barbero Senior"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as StaffStatus }))}
              className="w-full cursor-pointer rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Color de identificación
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, color: c }))}
                  className={cn(
                    'h-8 w-8 cursor-pointer rounded-full border-2 transition-all',
                    formData.color === c
                      ? 'border-surface-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="glow" isLoading={isSubmitting} disabled={modalOpen === 'create' && !formData.user_id}>
              {modalOpen === 'create' ? 'Agregar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen === 'delete'}
        onClose={() => {
          setModalOpen(null);
          setDeletingStaff(null);
        }}
        title="Eliminar personal"
      >
        {deletingStaff && (
          <div className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <p className="text-surface-600 dark:text-surface-400">
              ¿Estás seguro de que deseas eliminar a <strong>{deletingStaff.full_name}</strong> del personal?
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
