import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/infrastructure/supabase/server';

// Esquema de validación
const patchAppointmentSchema = z
  .object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
    notes: z.string().max(500).nullable().optional(),
    // Opcional: Podrías agregar aquí cancellation_reason si quisieras enviarlo desde el front
  })
  .refine((data) => data.status !== undefined || data.notes !== undefined, {
    message: 'Debes enviar al menos `status` o `notes`',
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Verificamos Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 2. Validamos los datos de entrada con Zod
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

    const { status, notes } = validation.data;

    // 3. Preparamos el Payload
    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    // Si viene notas, las asignamos al campo general de notas
    if (notes !== undefined) {
      payload.notes = notes;
    }

    // Si viene status, aplicamos la lógica inteligente
    if (status !== undefined) {
      payload.status = status;

      // 🔥 CORRECCIÓN CRÍTICA:
      if (status === 'cancelled') {
        payload.cancelled_at = new Date().toISOString();

        // AQUÍ ESTÁ EL CAMBIO:
        // No podemos poner texto libre. Debemos usar uno de los valores del ENUM:
        // 'client_request', 'staff_unavailable', 'business_closed', 'schedule_conflict', 'other'

        // Usamos 'other' por defecto para cumplir con la DB.
        // El detalle real ("El cliente llamó...") ya se está guardando en payload.notes arriba.
        payload.cancellation_reason = 'other';
      }
    }

    // 4. Ejecutamos el Update
    const { data, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select()
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
