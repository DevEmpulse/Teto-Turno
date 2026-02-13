import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/infrastructure/supabase/server';

const uuidSchema = z.string().uuid('ID inválido');

const patchAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  notes: z.string().max(500).nullable().optional(),
  internal_notes: z.string().max(1000).nullable().optional(),
  staff_id: uuidSchema.optional(),
  service_id: uuidSchema.optional(),
  scheduled_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(5).max(480).optional(),
  price: z.number().int().min(0).optional(),
  cancellation_reason: z
    .enum(['client_request', 'staff_unavailable', 'business_closed', 'schedule_conflict', 'other'])
    .optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = patchAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues[0]?.message ?? 'Datos inválidos',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const input = validation.data;
    const payload: Record<string, unknown> = {};

    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.internal_notes !== undefined) payload.internal_notes = input.internal_notes;
    if (input.status !== undefined) {
      payload.status = input.status;
      if (input.status === 'cancelled') {
        payload.cancelled_at = new Date().toISOString();
        payload.cancellation_reason = input.cancellation_reason ?? 'other';
      }
    }
    if (input.staff_id !== undefined) payload.staff_id = input.staff_id;
    if (input.service_id !== undefined) payload.service_id = input.service_id;
    if (input.scheduled_at !== undefined) payload.scheduled_at = input.scheduled_at;
    if (input.duration_minutes !== undefined) payload.duration_minutes = input.duration_minutes;
    if (input.price !== undefined) payload.price = input.price;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: 'Debes enviar al menos un campo para actualizar' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error DB:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ appointment: data }, { status: 200 });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
