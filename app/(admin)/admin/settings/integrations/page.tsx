'use client';

import Link from 'next/link';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlinePlus } from 'react-icons/hi2';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  category: 'calendar' | 'messaging' | 'payment' | 'marketing';
}

const integrations: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sincroniza las citas con tu calendario de Google',
    icon: '📅',
    connected: true,
    category: 'calendar',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Envía recordatorios y confirmaciones por WhatsApp',
    icon: '💬',
    connected: false,
    category: 'messaging',
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    description: 'Acepta pagos online y reservas con depósito',
    icon: '💳',
    connected: true,
    category: 'payment',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Añade el botón de reserva a tu perfil de Instagram',
    icon: '📸',
    connected: false,
    category: 'marketing',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecta con miles de aplicaciones automáticamente',
    icon: '⚡',
    connected: false,
    category: 'marketing',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sincroniza clientes para campañas de email marketing',
    icon: '✉️',
    connected: false,
    category: 'marketing',
  },
];

export default function IntegrationsSettingsPage() {
  const categories = [
    { key: 'calendar', label: 'Calendario' },
    { key: 'messaging', label: 'Mensajería' },
    { key: 'payment', label: 'Pagos' },
    { key: 'marketing', label: 'Marketing' },
  ];

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
            Integraciones
          </h1>
          <p className="mt-1 text-surface-500">
            Conecta Teto con otras aplicaciones
          </p>
        </div>
      </div>

      {categories.map((category) => {
        const categoryIntegrations = integrations.filter(
          (i) => i.category === category.key
        );
        if (categoryIntegrations.length === 0) return null;

        return (
          <Card key={category.key} variant="elevated">
            <CardHeader>
              <CardTitle>{category.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between rounded-xl border border-surface-200 p-4 dark:border-surface-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 text-2xl dark:bg-surface-800">
                        {integration.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-surface-900 dark:text-surface-50">
                            {integration.name}
                          </h3>
                          {integration.connected && (
                            <Badge variant="success" size="sm">
                              <HiOutlineCheck className="mr-1 h-3 w-3" />
                              Conectado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-surface-500">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {integration.connected ? (
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <HiOutlinePlus className="mr-2 h-4 w-4" />
                        Conectar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card variant="gradient">
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <h3 className="font-semibold text-surface-900 dark:text-surface-50">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="mt-1 text-sm text-surface-500">
              Contáctanos para solicitar nuevas integraciones
            </p>
          </div>
          <Button variant="outline">Solicitar Integración</Button>
        </CardContent>
      </Card>
    </div>
  );
}

