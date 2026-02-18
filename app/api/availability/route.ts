import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date'); // Formato YYYY-MM-DD
  const duration = searchParams.get('duration'); // Minutos

  if (!staffId || !date || !duration) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const supabase = await createClient();

  // Llamamos a tu función RPC de Postgres 'get_available_slots'
  // Esta función ya filtra horarios laborales, bloqueos y citas existentes.
  const { data: slots, error } = await supabase.rpc('get_available_slots', {
    p_staff_id: staffId,
    p_date: date,
    p_duration_minutes: parseInt(duration),
    p_slot_interval: parseInt(duration), // Intervalo de 45 min por defecto
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(slots);
}
