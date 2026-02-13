import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim();

    if (!email || email.length < 3) {
      return NextResponse.json(
        { error: 'Proporciona un email de al menos 3 caracteres' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .ilike('email', `%${email}%`)
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: (data ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        full_name: `${u.first_name} ${u.last_name}`.trim(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
