import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSchema } from '@/lib/validations/service';
import { createClient } from '@/infrastructure/supabase/server';
import type { Database } from '@/infrastructure/supabase/database.types';

const businessIdSchema = z.string().uuid('businessId inválido');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    const businessIdValidation = businessIdSchema.safeParse(businessId);
    if (!businessIdValidation.success) {
      return NextResponse.json(
        { error: businessIdValidation.error.issues[0]?.message ?? 'businessId inválido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessIdValidation.data)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services: data ?? [] }, { status: 200 });
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
    const validation = createServiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input = validation.data;
    const insertPayload: Database['public']['Tables']['services']['Insert'] = {
      business_id: input.business_id,
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      duration_minutes: input.duration_minutes,
      price: input.price,
      currency: input.currency,
      status: input.status,
      image_url: input.image_url ?? null,
      sort_order: input.sort_order,
      requires_deposit: input.requires_deposit,
      deposit_amount: input.deposit_amount ?? null,
    };

    const { data, error } = await supabase
      .from('services')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
