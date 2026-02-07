import { Card, CardContent } from '@/presentation/components/ui/card';

export default function AppointmentsPage() {
  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Citas</h1>
        <p className="mt-1 text-surface-500">Conecta este módulo a un endpoint `/api/appointments`.</p>
      </div>

      <Card variant="elevated">
        <CardContent className="py-12 text-center text-surface-500">
          No hay endpoint de citas implementado en `/api`.
        </CardContent>
      </Card>
    </div>
  );
}
