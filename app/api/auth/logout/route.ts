import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

// Eliminamos "request: Request" de aquí
export async function POST() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Sesión cerrada' }, { status: 200 });
}
