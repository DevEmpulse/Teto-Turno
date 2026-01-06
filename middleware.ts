import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // In development without Supabase, just continue
  const hasSupabaseConfig = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasSupabaseConfig) {
    // Allow all routes in development without Supabase
    return NextResponse.next();
  }

  // When Supabase is configured, use session management
  const { updateSession } = await import('@/infrastructure/supabase/middleware');
  const response = await updateSession(request);

  // For now, we'll allow all routes in development
  // In production, implement auth checks:
  //
  // Protected routes: ['/admin', '/dashboard', '/booking/confirm']
  // Auth routes (redirect if logged in): ['/login', '/register', '/forgot-password']
  // Admin-only routes: ['/admin']

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
