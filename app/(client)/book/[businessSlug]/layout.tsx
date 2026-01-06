import Link from 'next/link';

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-950/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href={`/book/${businessSlug}`}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <div>
              <span className="font-semibold text-surface-900 dark:text-surface-50">
                Barbería Premium
              </span>
              <p className="text-xs text-surface-500">Reservar cita</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
