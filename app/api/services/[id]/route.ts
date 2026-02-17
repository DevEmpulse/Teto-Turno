import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateServiceSchema } from '@/lib/validations/service';
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
    const inputValidation = updateServiceSchema.safeParse(body);

    if (!inputValidation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: inputValidation.error.flatten() },
        { status: 400 }
      );
    }

    const input = inputValidation.data;
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.category !== undefined) payload.category = input.category;
    if (input.duration_minutes !== undefined) payload.duration_minutes = input.duration_minutes;
    if (input.price !== undefined) payload.price = input.price;
    if (input.status !== undefined) payload.status = input.status;
    if (input.image_url !== undefined) payload.image_url = input.image_url;
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
    if (input.requires_deposit !== undefined) payload.requires_deposit = input.requires_deposit;
    if (input.deposit_amount !== undefined) payload.deposit_amount = input.deposit_amount;
    if (input.currency !== undefined) payload.currency = input.currency;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service: data }, { status: 200 });
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

    const { error } = await supabase.from('services').delete().eq('id', id);

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
