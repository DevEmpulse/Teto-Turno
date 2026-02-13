import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTransactionSchema } from '@/lib/validations/transaction';
import { createClient } from '@/infrastructure/supabase/server';
import type { Database, Json } from '@/infrastructure/supabase/database.types';

const businessIdSchema = z.string().uuid('businessId inválido');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || searchParams.get('business_id');

    const businessIdValidation = businessIdSchema.safeParse(businessId);
    if (!businessIdValidation.success) {
      return NextResponse.json(
        { error: businessIdValidation.error.issues[0]?.message ?? 'businessId inválido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessIdValidation.data)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: data ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input = validation.data;
    const metadata: Json | undefined =
      input.expense_category != null
        ? ({ expense_category: input.expense_category } as Json)
        : undefined;
    const insertPayload: Database['public']['Tables']['transactions']['Insert'] = {
      business_id: input.business_id,
      appointment_id: input.appointment_id ?? null,
      client_id: input.client_id ?? null,
      staff_id: input.staff_id ?? null,
      type: input.type,
      status: input.status ?? 'pending',
      amount: input.amount,
      currency: input.currency ?? 'ARS',
      payment_method: input.payment_method,
      description: input.description ?? null,
      reference: input.reference ?? null,
      ...(metadata && { metadata }),
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transaction: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
