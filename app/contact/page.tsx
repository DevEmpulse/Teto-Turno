import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-50 py-16 dark:bg-surface-950">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-surface-900 dark:text-surface-50">
          Contacto
        </h1>
        <div className="mt-8">
          <p className="text-surface-600 dark:text-surface-400">
            ¿Tienes preguntas? Estamos aquí para ayudarte.
          </p>
          <div className="mt-6 space-y-4">
            <p>
              <strong>Email:</strong> soporte@teto.app
            </p>
            <p>
              <strong>Horario:</strong> Lun - Vie, 9:00 - 18:00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

