import type { Metadata, Viewport } from 'next/types';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Teto',
    default: 'Teto - Gestión de Reservas Simplificada',
  },
  description:
    'Plataforma de gestión de reservas para peluquerías, barberías y centros de estética. Agenda citas, gestiona tu equipo y haz crecer tu negocio.',
  keywords: [
    'reservas',
    'citas',
    'barbería',
    'peluquería',
    'gestión',
    'turnos',
    'agenda',
  ],
  authors: [{ name: 'Teto' }],
  creator: 'Teto',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Teto',
    title: 'Teto - Gestión de Reservas Simplificada',
    description:
      'Plataforma de gestión de reservas para peluquerías, barberías y centros de estética.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teto - Gestión de Reservas Simplificada',
    description:
      'Plataforma de gestión de reservas para peluquerías, barberías y centros de estética.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Satoshi Font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

