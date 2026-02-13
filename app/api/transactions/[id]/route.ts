import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateTransactionSchema } from '@/lib/validations/transaction';
import type { Json } from '@/infrastructure/supabase/database.types';
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
    const inputValidation = updateTransactionSchema.safeParse(body);

    if (!inputValidation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: inputValidation.error.flatten() },
        { status: 400 }
      );
    }

    const input = inputValidation.data;
    const payload: Record<string, unknown> = {};

    if (input.appointment_id !== undefined) payload.appointment_id = input.appointment_id;
    if (input.client_id !== undefined) payload.client_id = input.client_id;
    if (input.staff_id !== undefined) payload.staff_id = input.staff_id;
    if (input.type !== undefined) payload.type = input.type;
    if (input.status !== undefined) payload.status = input.status;
    if (input.amount !== undefined) payload.amount = input.amount;
    if (input.currency !== undefined) payload.currency = input.currency;
    if (input.payment_method !== undefined) payload.payment_method = input.payment_method;
    if (input.description !== undefined) payload.description = input.description;
    if (input.reference !== undefined) payload.reference = input.reference;
    if (input.expense_category !== undefined) {
      const { data: current } = await supabase
        .from('transactions')
        .select('metadata')
        .eq('id', id)
        .single();
      const existingMeta =
        (current?.metadata as Record<string, unknown>) ?? {};
      payload.metadata = {
        ...existingMeta,
        expense_category: input.expense_category,
      } as Json;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transaction: data }, { status: 200 });
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

    const { error } = await supabase.from('transactions').delete().eq('id', id);

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
