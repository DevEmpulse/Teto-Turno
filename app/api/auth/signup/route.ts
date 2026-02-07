import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const body = await request.json();
  const { email, password, first_name, last_name } = body;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Importante: redirige a nuestro callback después de verificar
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
      data: {
        first_name,
        last_name,
        role: 'client', // O 'owner' si es el registro de dueños
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: 'Usuario creado. Revisa tu email para confirmar.' },
    { status: 200 }
  );
}
