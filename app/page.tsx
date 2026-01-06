import Link from 'next/link';
import {
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineDevicePhoneMobile,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { Button } from '@/presentation/components/ui/button';

const features = [
  {
    icon: HiOutlineCalendarDays,
    title: 'Reservas Online 24/7',
    description:
      'Tus clientes pueden reservar en cualquier momento, desde cualquier dispositivo.',
  },
  {
    icon: HiOutlineUsers,
    title: 'Gestión de Equipo',
    description:
      'Asigna servicios, horarios y permisos a cada miembro de tu equipo fácilmente.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Reportes y Analytics',
    description:
      'Visualiza ingresos, ocupación y rendimiento de tu negocio en tiempo real.',
  },
  {
    icon: HiOutlineBell,
    title: 'Recordatorios Automáticos',
    description:
      'Reduce las ausencias con recordatorios por email y SMS automáticos.',
  },
  {
    icon: HiOutlineDevicePhoneMobile,
    title: 'App para Clientes',
    description:
      'Tus clientes pueden ver su historial, próximas citas y reservar desde el móvil.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Seguridad Garantizada',
    description:
      'Datos encriptados y cumplimiento con estándares de seguridad internacionales.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '0',
    description: 'Perfecto para empezar',
    features: [
      'Hasta 50 citas/mes',
      '1 profesional',
      'Reservas online',
      'Recordatorios básicos',
    ],
    cta: 'Empezar Gratis',
    popular: false,
  },
  {
    name: 'Pro',
    price: '4.999',
    description: 'Para negocios en crecimiento',
    features: [
      'Citas ilimitadas',
      'Hasta 5 profesionales',
      'Reportes avanzados',
      'SMS ilimitados',
      'Soporte prioritario',
    ],
    cta: 'Probar 14 días gratis',
    popular: true,
  },
  {
    name: 'Business',
    price: '9.999',
    description: 'Para grandes equipos',
    features: [
      'Todo de Pro',
      'Profesionales ilimitados',
      'Multi-sucursal',
      'API access',
      'Account manager',
    ],
    cta: 'Contactar ventas',
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-surface-200/50 bg-white/80 backdrop-blur-xl dark:border-surface-800/50 dark:bg-surface-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-surface-50">
              Teto
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50"
            >
              Funciones
            </Link>
            <Link
              href="#pricing"
              className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50"
            >
              Precios
            </Link>
            <Link
              href="/login"
              className="text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-50"
            >
              Iniciar Sesión
            </Link>
            <Link href="/register">
              <Button variant="glow" size="sm">
                Empezar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[600px] w-[600px] rounded-full bg-primary-500/20 blur-3xl" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className="h-[400px] w-[400px] rounded-full bg-accent-500/20 blur-3xl" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300">
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              Nuevo: Integración con WhatsApp Business
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-5xl lg:text-6xl">
              La forma más fácil de{' '}
              <span className="gradient-text">gestionar reservas</span>
            </h1>

            <p className="mt-6 text-lg text-surface-600 dark:text-surface-400 sm:text-xl">
              Todo lo que necesitas para hacer crecer tu barbería, peluquería o salón
              de belleza. Reservas online, gestión de equipo y más.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="xl" variant="glow" rightIcon={<HiOutlineArrowRight />}>
                  Empezar Gratis
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="xl" variant="outline">
                  Ver Demo
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-sm text-surface-500">
              +500 negocios ya confían en Teto
            </p>
          </div>

          {/* Hero image/mockup */}
          <div className="mt-16 rounded-2xl border border-surface-200 bg-white/50 p-2 shadow-2xl shadow-surface-200/50 backdrop-blur-sm dark:border-surface-800 dark:bg-surface-900/50 dark:shadow-surface-950/50">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900">
              {/* Placeholder for dashboard screenshot */}
              <div className="flex h-full items-center justify-center">
                <p className="text-surface-400">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-4xl">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mt-4 text-lg text-surface-600 dark:text-surface-400">
              Herramientas potentes diseñadas para simplificar la gestión de tu negocio.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-surface-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 dark:border-surface-800 dark:bg-surface-900"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-900/30 dark:text-primary-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-surface-600 dark:text-surface-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-surface-100 dark:bg-surface-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50 sm:text-4xl">
              Precios simples y transparentes
            </h2>
            <p className="mt-4 text-lg text-surface-600 dark:text-surface-400">
              Elige el plan que mejor se adapte a tu negocio. Sin sorpresas.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 dark:bg-surface-950 ${
                  plan.popular
                    ? 'border-primary-500 shadow-xl shadow-primary-500/20'
                    : 'border-surface-200 dark:border-surface-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary-600 px-4 py-1 text-sm font-medium text-white">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-surface-500">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-surface-900 dark:text-surface-50">
                      ${plan.price}
                    </span>
                    <span className="text-surface-500">/mes</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <HiOutlineCheck className="h-5 w-5 text-primary-500" />
                      <span className="text-surface-600 dark:text-surface-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'glow' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-16 text-center sm:px-16">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10 pattern-dots text-white" />

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Empieza a crecer tu negocio hoy
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Únete a cientos de negocios que ya están simplificando sus reservas
                con Teto.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button
                    size="xl"
                    className="bg-white text-primary-600 hover:bg-white/90"
                  >
                    Crear cuenta gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-12 dark:border-surface-800 dark:bg-surface-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="font-bold text-surface-900 dark:text-surface-50">
                Teto
              </span>
            </div>

            <div className="flex gap-8 text-sm text-surface-600 dark:text-surface-400">
              <Link href="/terms" className="hover:text-surface-900 dark:hover:text-surface-50">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-surface-900 dark:hover:text-surface-50">
                Privacidad
              </Link>
              <Link href="/contact" className="hover:text-surface-900 dark:hover:text-surface-50">
                Contacto
              </Link>
            </div>

            <p className="text-sm text-surface-500">
              © 2024 Teto. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

