import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verificamos si es un usuario logueado (cliente o staff)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    const {
      business_id,
      staff_id,
      service_id,
      scheduled_at, // ISO String (ej: 2026-02-10T14:00:00)
      duration_minutes,
      price,
    } = body;

    // Calculamos la hora de fin
    const startDate = new Date(scheduled_at);
    const endDate = new Date(startDate.getTime() + duration_minutes * 60000);

    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          business_id,
          staff_id,
          service_id,
          client_id: user?.id, // Si el usuario está logueado, lo vinculamos
          scheduled_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          duration_minutes,
          price, // Recuerda: centavos
          status: 'confirmed', // O 'pending' si configuras confirmación manual
          source: 'web',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
