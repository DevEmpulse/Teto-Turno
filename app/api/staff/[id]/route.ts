import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateStaffSchema } from '@/lib/validations/staff';
import { createClient } from '@/infrastructure/supabase/server';

const uuidSchema = z.string().uuid('ID inválido');

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const inputValidation = updateStaffSchema.safeParse(body);

    if (!inputValidation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: inputValidation.error.flatten() },
        { status: 400 }
      );
    }

    const input = inputValidation.data;
    const payload: Record<string, unknown> = {};

    if (input.title !== undefined) payload.title = input.title;
    if (input.bio !== undefined) payload.bio = input.bio;
    if (input.status !== undefined) payload.status = input.status;
    if (input.break_duration_minutes !== undefined)
      payload.break_duration_minutes = input.break_duration_minutes;
    if (input.max_daily_appointments !== undefined)
      payload.max_daily_appointments = input.max_daily_appointments;
    if (input.color !== undefined) payload.color = input.color;
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('staff')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const validation = uuidSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
