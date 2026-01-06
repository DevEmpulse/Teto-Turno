import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-50 py-16 dark:bg-surface-950">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="text-primary-600 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-8 text-3xl font-bold text-surface-900 dark:text-surface-50">
          Términos de Servicio
        </h1>
        <div className="mt-8 prose dark:prose-invert">
          <p>Última actualización: Enero 2024</p>
          <h2>1. Aceptación de términos</h2>
          <p>
            Al usar Teto, aceptas estos términos de servicio y nuestra política de privacidad.
          </p>
          <h2>2. Uso del servicio</h2>
          <p>
            Teto es una plataforma de gestión de reservas diseñada para negocios de servicios.
          </p>
        </div>
      </div>
    </div>
  );
}

