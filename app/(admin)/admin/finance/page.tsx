'use client';

import * as React from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineCreditCard,
} from 'react-icons/hi2';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Modal } from '@/presentation/components/ui/modal';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type Business = { id: string; name: string };

type TransactionType = 'payment' | 'refund' | 'deposit' | 'adjustment' | 'tip';
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago' | 'other';
type ExpenseCategory = 'salary' | 'rent' | 'supplies' | 'utilities' | 'other';

type ApiTransaction = {
  id: string;
  business_id: string;
  appointment_id: string | null;
  client_id: string | null;
  staff_id: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  description: string | null;
  reference: string | null;
  metadata?: { expense_category?: ExpenseCategory };
  created_at: string;
  updated_at: string;
};

const TYPE_LABELS: Record<TransactionType, string> = {
  payment: 'Pago',
  refund: 'Reembolso',
  deposit: 'Depósito',
  adjustment: 'Gasto',
  tip: 'Propina',
};

const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: 'Sueldo',
  rent: 'Alquiler',
  supplies: 'Insumos',
  utilities: 'Servicios (luz, gas, etc.)',
  other: 'Otro gasto',
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
  partially_refunded: 'Reembolso parcial',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
  other: 'Otro',
};

const INCOME_TYPES: TransactionType[] = ['payment', 'tip', 'deposit'];
const EXPENSE_TYPES: TransactionType[] = ['refund', 'adjustment'];

function formatAmount(amount: number, currency = 'ARS'): string {
  const sign = currency === 'ARS' ? '$' : currency + ' ';
  return sign + (amount / 100).toLocaleString('es-AR');
}

export default function FinancePage() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>('');
  const [transactions, setTransactions] = React.useState<ApiTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState<'create' | 'edit' | 'delete' | null>(null);
  const [isExpenseModal, setIsExpenseModal] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<ApiTransaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<ApiTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    type: 'payment' as TransactionType,
    status: 'completed' as TransactionStatus,
    amount: '',
    payment_method: 'cash' as PaymentMethod,
    description: '',
    reference: '',
    expense_category: '' as ExpenseCategory | '',
  });

  const loadTransactions = React.useCallback(async () => {
    if (!selectedBusinessId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/transactions?businessId=${selectedBusinessId}`, {
        cache: 'no-store',
      });
      const json = (await res.json()) as { transactions?: ApiTransaction[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al cargar');
      setTransactions(json.transactions ?? []);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      setTransactions([]);
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
        const first = fetched[0];
        if (first && !selectedBusinessId) {
          setSelectedBusinessId(first.id);
        }
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Error de conexión');
      } finally {
        setIsLoading(false);
      }
    };
    void loadBusinesses();
  }, []);

  React.useEffect(() => {
    if (selectedBusinessId) void loadTransactions();
    else setTransactions([]);
  }, [selectedBusinessId, loadTransactions]);

  const resetForm = () => {
    setFormData({
      type: 'payment',
      status: 'completed',
      amount: '',
      payment_method: 'cash',
      description: '',
      reference: '',
      expense_category: '',
    });
    setFormError(null);
    setEditingTransaction(null);
    setDeletingTransaction(null);
  };

  const openCreate = () => {
    resetForm();
    setIsExpenseModal(false);
    setModalOpen('create');
  };

  const openCreateExpense = () => {
    resetForm();
    setFormData((p) => ({ ...p, type: 'adjustment', expense_category: 'other' }));
    setIsExpenseModal(true);
    setModalOpen('create');
  };

  const openEdit = (t: ApiTransaction) => {
    setIsExpenseModal(false);
    setEditingTransaction(t);
    const meta = t.metadata as { expense_category?: ExpenseCategory } | undefined;
    setFormData({
      type: t.type,
      status: t.status,
      amount: String(t.amount / 100),
      payment_method: t.payment_method,
      description: t.description ?? '',
      reference: t.reference ?? '',
      expense_category: meta?.expense_category ?? '',
    });
    setFormError(null);
    setModalOpen('edit');
  };

  const openDelete = (t: ApiTransaction) => {
    setDeletingTransaction(t);
    setModalOpen('delete');
  };

  const parseAmount = (s: string): number => {
    const cleaned = s.replace(/[^\d.]/g, '');
    const pesos = parseFloat(cleaned) || 0;
    return Math.round(pesos * 100);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const amount = parseAmount(formData.amount);
    if (amount <= 0) {
      setFormError('El monto debe ser mayor a 0');
      setIsSubmitting(false);
      return;
    }
    try {
      const body: Record<string, unknown> = {
        business_id: selectedBusinessId,
        type: formData.type,
        status: formData.status,
        amount,
        currency: 'ARS',
        payment_method: formData.payment_method,
        description: formData.description.trim() || null,
        reference: formData.reference.trim() || null,
      };
      if (formData.type === 'adjustment') {
        body.expense_category = formData.expense_category || 'other';
      }
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al crear');
      setSuccessMessage('Transacción creada correctamente');
      setModalOpen(null);
      resetForm();
      void loadTransactions();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setFormError(null);
    setIsSubmitting(true);
    const amount = parseAmount(formData.amount);
    if (amount <= 0) {
      setFormError('El monto debe ser mayor a 0');
      setIsSubmitting(false);
      return;
    }
    try {
      const body: Record<string, unknown> = {
        type: formData.type,
        status: formData.status,
        amount,
        payment_method: formData.payment_method,
        description: formData.description.trim() || null,
        reference: formData.reference.trim() || null,
      };
      if (formData.type === 'adjustment') {
        body.expense_category = formData.expense_category || null;
      }
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al actualizar');
      setSuccessMessage('Transacción actualizada correctamente');
      setModalOpen(null);
      resetForm();
      void loadTransactions();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/transactions/${deletingTransaction.id}`, { method: 'DELETE' });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Error al eliminar');
      setSuccessMessage('Transacción eliminada correctamente');
      setModalOpen(null);
      resetForm();
      void loadTransactions();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => INCOME_TYPES.includes(t.type) && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => EXPENSE_TYPES.includes(t.type) && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  React.useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Finanzas</h1>
          <p className="mt-1 text-surface-500">Gestiona ingresos, gastos y transacciones.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={openCreateExpense}
            variant="outline"
            leftIcon={<HiOutlineCreditCard className="h-5 w-5" />}
            disabled={!selectedBusinessId}
          >
            Registrar gasto
          </Button>
          <Button
            onClick={openCreate}
            variant="glow"
            leftIcon={<HiOutlinePlus className="h-5 w-5" />}
            disabled={!selectedBusinessId}
          >
            Nueva transacción
          </Button>
        </div>
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

      <div className="min-w-64 max-w-xs">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-surface-500">
              <HiOutlineArrowTrendingUp className="h-5 w-5" />
              <span className="text-sm">Ingresos</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {isLoading ? '...' : formatAmount(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-surface-500">
              <HiOutlineArrowTrendingDown className="h-5 w-5" />
              <span className="text-sm">Egresos</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {isLoading ? '...' : formatAmount(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-surface-500">
              <HiOutlineBanknotes className="h-5 w-5" />
              <span className="text-sm">Balance</span>
            </div>
            <p
              className={`mt-1 text-2xl font-bold ${balance >= 0 ? 'text-primary-600' : 'text-red-600'}`}
            >
              {isLoading ? '...' : formatAmount(balance >= 0 ? balance : -balance)}
              {balance < 0 ? ' (-)' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="px-4 py-3 text-left font-medium text-surface-700 dark:text-surface-300">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-surface-700 dark:text-surface-300">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-surface-700 dark:text-surface-300">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-surface-700 dark:text-surface-300">
                    Método
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-surface-700 dark:text-surface-300">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-surface-700 dark:text-surface-300">
                    Monto
                  </th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-surface-500">
                      Cargando...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-surface-500">
                      No hay transacciones. Crea una nueva para comenzar.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const isIncome = INCOME_TYPES.includes(t.type);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/50"
                      >
                        <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                          {format(parseISO(t.created_at), 'd MMM yyyy, HH:mm', { locale: es })}
                        </td>
                        <td className="px-4 py-3">
                          {t.type === 'adjustment' &&
                          (t.metadata as { expense_category?: ExpenseCategory } | undefined)
                            ?.expense_category ? (
                            <span>
                              {TYPE_LABELS[t.type]} ·{' '}
                              {
                                EXPENSE_CATEGORY_LABELS[
                                  (t.metadata as { expense_category: ExpenseCategory }).expense_category
                                ]
                              }
                            </span>
                          ) : (
                            TYPE_LABELS[t.type]
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              t.status === 'completed'
                                ? 'text-green-600'
                                : t.status === 'failed'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                            }
                          >
                            {STATUS_LABELS[t.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">{PAYMENT_METHOD_LABELS[t.payment_method]}</td>
                        <td className="max-w-40 truncate px-4 py-3 text-surface-600 dark:text-surface-400">
                          {t.description ?? '-'}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatAmount(t.amount, t.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(t)}
                              className="cursor-pointer rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-900 dark:hover:bg-surface-700 dark:hover:text-surface-100"
                              aria-label="Editar"
                            >
                              <HiOutlinePencilSquare className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDelete(t)}
                              className="cursor-pointer rounded-lg p-2 text-surface-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              aria-label="Eliminar"
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen === 'create' || modalOpen === 'edit'}
        onClose={() => {
          setModalOpen(null);
          resetForm();
        }}
        title={
          modalOpen === 'create'
            ? isExpenseModal
              ? 'Registrar gasto'
              : 'Nueva transacción'
            : 'Editar transacción'
        }
      >
        <form onSubmit={modalOpen === 'create' ? handleCreate : handleEdit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((p) => ({ ...p, type: e.target.value as TransactionType }))
              }
              className="mt-1 w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {(Object.keys(TYPE_LABELS) as TransactionType[]).map((k) => (
                <option key={k} value={k}>
                  {TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          {formData.type === 'adjustment' && (
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Categoría del gasto
              </label>
              <select
                value={formData.expense_category || 'other'}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    expense_category: e.target.value as ExpenseCategory,
                  }))
                }
                className="mt-1 w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
              >
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {EXPENSE_CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((p) => ({ ...p, status: e.target.value as TransactionStatus }))
              }
              className="mt-1 w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {(Object.keys(STATUS_LABELS) as TransactionStatus[]).map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Monto (ARS)
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 15000"
              value={formData.amount}
              onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Método de pago
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData((p) => ({ ...p, payment_method: e.target.value as PaymentMethod }))
              }
              className="mt-1 w-full cursor-pointer rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-surface-700 dark:bg-surface-900"
            >
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((k) => (
                <option key={k} value={k}>
                  {PAYMENT_METHOD_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Descripción
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Ej: Corte de cabello - Juan"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Referencia
            </label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData((p) => ({ ...p, reference: e.target.value }))}
              placeholder="Opcional"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="glow" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : modalOpen === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen === 'delete'}
        onClose={() => {
          setModalOpen(null);
          resetForm();
        }}
        title="Eliminar transacción"
      >
        {deletingTransaction && (
          <div className="space-y-4">
            <p className="text-surface-600 dark:text-surface-400">
              ¿Estás seguro de eliminar esta transacción de{' '}
              <strong>
                {formatAmount(deletingTransaction.amount)} ({TYPE_LABELS[deletingTransaction.type]})
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                leftIcon={<HiOutlineTrash className="h-4 w-4" />}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
