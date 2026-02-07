import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // "next" es a donde queremos enviar al usuario después de loguearse (ej: /dashboard)
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Si todo sale bien, lo mandamos al dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si algo falla, lo mandamos a una pagina de error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
