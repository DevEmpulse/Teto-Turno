import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createStaffSchema } from '@/lib/validations/staff';
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
      .from('staff_with_user')
      .select('*')
      .eq('business_id', businessIdValidation.data)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data ?? [] }, { status: 200 });
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
    const validation = createStaffSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const input = validation.data;

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        role: input.role,
        business_id: input.business_id,
      })
      .eq('id', input.user_id);

    if (userUpdateError) {
      return NextResponse.json({ error: userUpdateError.message }, { status: 400 });
    }

    const insertPayload: Database['public']['Tables']['staff']['Insert'] = {
      user_id: input.user_id,
      business_id: input.business_id,
      title: input.title ?? null,
      bio: input.bio ?? null,
      status: input.status,
      break_duration_minutes: input.break_duration_minutes,
      max_daily_appointments: input.max_daily_appointments ?? null,
      color: input.color,
      sort_order: input.sort_order,
    };

    const { data, error } = await supabase
      .from('staff')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Este usuario ya pertenece al staff de este negocio' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staff: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
