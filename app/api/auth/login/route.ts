import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: 'Sesión iniciada correctamente' }, { status: 200 });
}
