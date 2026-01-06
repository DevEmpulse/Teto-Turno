import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-50 py-16 dark:bg-surface-950">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-surface-900 dark:text-surface-50">
          Política de Privacidad
        </h1>
        <div className="mt-8 prose dark:prose-invert">
          <p>Última actualización: Enero 2024</p>
          <h2>1. Información que recopilamos</h2>
          <p>
            Recopilamos información que nos proporcionas directamente al usar nuestros servicios.
          </p>
          <h2>2. Uso de la información</h2>
          <p>
            Utilizamos la información para proporcionar y mejorar nuestros servicios.
          </p>
        </div>
      </div>
    </div>
  );
}

