'use client';

import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineCreditCard, HiOutlineDocumentText, HiOutlineCheck } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: 0,
    features: ['Hasta 50 citas/mes', '1 profesional', 'Reservas online', 'Recordatorios básicos'],
    current: false,
  },
  {
    name: 'Pro',
    price: 4999,
    features: ['Citas ilimitadas', 'Hasta 5 profesionales', 'Reportes avanzados', 'SMS ilimitados', 'Soporte prioritario'],
    current: true,
  },
  {
    name: 'Business',
    price: 9999,
    features: ['Todo de Pro', 'Profesionales ilimitados', 'Multi-sucursal', 'API access', 'Account manager'],
    current: false,
  },
];

const invoices = [
  { id: 'INV-001', date: '1 Ene 2024', amount: 4999, status: 'paid' },
  { id: 'INV-002', date: '1 Dic 2023', amount: 4999, status: 'paid' },
  { id: 'INV-003', date: '1 Nov 2023', amount: 4999, status: 'paid' },
];

export default function BillingSettingsPage() {
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
            Facturación
          </h1>
          <p className="mt-1 text-surface-500">
            Administra tu plan y método de pago
          </p>
        </div>
      </div>

      {/* Current plan */}
      <Card variant="gradient">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-surface-900 dark:text-surface-50">
                  Plan Pro
                </h3>
                <Badge variant="glow">Activo</Badge>
              </div>
              <p className="mt-1 text-surface-500">
                $4.999/mes • Próxima facturación: 1 Feb 2024
              </p>
            </div>
            <Button variant="outline">Cambiar Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Planes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-4 ${
                  plan.current
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-800'
                }`}
              >
                <h4 className="font-semibold text-surface-900 dark:text-surface-50">
                  {plan.name}
                </h4>
                <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-surface-50">
                  ${plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-surface-500">/mes</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <HiOutlineCheck className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.current && (
                  <Badge variant="success" className="mt-4">
                    Plan Actual
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineCreditCard className="h-5 w-5" />
            Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-xs font-bold text-white">
                VISA
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50">
                  •••• •••• •••• 4242
                </p>
                <p className="text-sm text-surface-500">Expira 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Cambiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiOutlineDocumentText className="h-5 w-5" />
            Historial de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800"
              >
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-50">
                    {invoice.id}
                  </p>
                  <p className="text-sm text-surface-500">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-surface-900 dark:text-surface-50">
                    ${invoice.amount.toLocaleString()}
                  </span>
                  <Badge variant="success" size="sm">Pagado</Badge>
                  <Button variant="ghost" size="sm">
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

