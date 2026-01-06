export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10 pattern-dots text-white" />
          
          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
            {/* Logo */}
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <span className="text-3xl font-bold">T</span>
            </div>

            {/* Headline */}
            <h1 className="text-center text-4xl font-bold tracking-tight">
              Gestiona tu negocio
              <br />
              <span className="text-accent-300">sin complicaciones</span>
            </h1>

            <p className="mt-4 max-w-md text-center text-lg text-white/80">
              Reservas, agenda, finanzas y más. Todo lo que necesitas para hacer
              crecer tu negocio en un solo lugar.
            </p>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              {[
                'Reservas 24/7',
                'Gestión de equipo',
                'Reportes financieros',
                'Recordatorios automáticos',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-white/90"
                >
                  <div className="h-2 w-2 rounded-full bg-accent-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Floating elements for visual interest */}
            <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-white/5 blur-xl" />
            <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-accent-500/20 blur-2xl" />
            <div className="absolute right-20 top-1/3 h-16 w-16 rounded-full bg-white/10 animate-float" />
          </div>
        </div>
      </div>
    </div>
  );
}

