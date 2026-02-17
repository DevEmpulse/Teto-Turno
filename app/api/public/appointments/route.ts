import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/public/appointments?slug=barberia-esparta&email=cliente@mail.com
 * Devuelve las reservas del cliente con ese email en ese negocio (solo datos públicos).
 * Usa service_role para poder leer appointments/customers sin sesión.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const email = searchParams.get('email')?.trim()?.toLowerCase();

  if (!slug) {
    return NextResponse.json({ error: 'Falta el slug del negocio' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Falta el email' }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta' },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  try {
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    if (bizError || !business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      );
    }

    const businessId = business.id;

    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', businessId)
      .ilike('email', email);

    if (custError) {
      console.error('Error fetching customers:', custError);
      return NextResponse.json({ error: custError.message }, { status: 500 });
    }

    const customerIds = (customers ?? []).map((c) => c.id);
    if (customerIds.length === 0) {
      return NextResponse.json({ appointments: [] }, { status: 200 });
    }

    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select(
        `
        id,
        scheduled_at,
        status,
        duration_minutes,
        price,
        services ( name ),
        staff ( id )
        `
      )
      .eq('business_id', businessId)
      .in('customer_id', customerIds)
      .order('scheduled_at', { ascending: false });

    if (aptError) {
      console.error('Error fetching appointments:', aptError);
      return NextResponse.json({ error: aptError.message }, { status: 500 });
    }

    return NextResponse.json({ appointments: appointments ?? [] }, { status: 200 });
  } catch (e) {
    console.error('Public appointments error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error al buscar reservas' },
      { status: 500 }
    );
  }
}
