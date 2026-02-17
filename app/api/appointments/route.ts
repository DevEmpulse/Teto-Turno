import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Cliente Admin
import { createClient as createServerClient } from '@/infrastructure/supabase/server'; // Cliente Normal

export async function GET(request: Request) {
  const supabase = await createServerClient();

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId') || searchParams.get('business_id');

  if (!businessId) {
    return NextResponse.json({ error: 'businessId es requerido' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        id,
        scheduled_at,
        status,
        price,
        duration_minutes,
        staff_id,
        service_id,
        customers (
          full_name,
          email,
          phone
        ),
        services (
          id,
          name,
          price,
          duration_minutes
        ),
        staff (
          id,
          title
        )
      `
      )
      .eq('business_id', businessId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appointments: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    const {
      business_id,
      staff_id,
      service_id,
      scheduled_at,
      duration_minutes,
      price,
      notes,
      full_name,
      email,
      phone,
    } = body;

    // Validación básica
    if (!business_id || !scheduled_at || !duration_minutes) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const startDate = new Date(scheduled_at);
    const endDate = new Date(startDate.getTime() + duration_minutes * 60000);

    // --------------------------------------------------------------------------
    // 1. INICIALIZAMOS ADMIN
    // --------------------------------------------------------------------------
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Falta configuración del servidor (SUPABASE_SERVICE_ROLE_KEY)');
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // --------------------------------------------------------------------------
    // 2. VERIFICACIÓN ANTI-OVERBOOKING
    // --------------------------------------------------------------------------
    const { data: conflict } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('staff_id', staff_id)
      .neq('status', 'cancelled')
      .lt('scheduled_at', endDate.toISOString())
      .gt('end_at', startDate.toISOString())
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: '¡Uy! Alguien acaba de reservar este horario. Por favor elige otro.' },
        { status: 409 }
      );
    }

    // --------------------------------------------------------------------------
    // 3. LÓGICA CRM (Limpia y Directa)
    // --------------------------------------------------------------------------

    let customerId = null;

    if (email) {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('business_id', business_id)
        .eq('email', email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;

        // ACTUALIZAR DATOS
        // Usamos las variables directas que coinciden con las columnas
        if (full_name || phone) {
          await supabaseAdmin
            .from('customers')
            .update({
              full_name, // ES6 Shorthand para full_name: full_name
              phone, // ES6 Shorthand para phone: phone
            })
            .eq('id', customerId);

          console.log(`Datos actualizados para cliente ID: ${customerId}`);
        }
      }
    }

    // CREAR CLIENTE NUEVO
    if (!customerId && (full_name || email)) {
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert([
          {
            business_id,
            full_name: full_name || 'Cliente Sin Nombre',
            email: email || null,
            phone: phone || null,
          },
        ])
        .select('id')
        .single();

      if (createError) {
        console.error('Error al crear cliente en CRM:', createError);
      } else {
        customerId = newCustomer.id;
      }
    }

    // --------------------------------------------------------------------------
    // 4. INSERTAR LA CITA
    // --------------------------------------------------------------------------
    const { data: appointmentData, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([
        {
          business_id,
          staff_id,
          service_id,
          client_id: user?.id || null,
          customer_id: customerId,
          scheduled_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          duration_minutes,
          price,
          status: 'confirmed',
          notes: notes || null,
          source: 'web',
        },
      ])
      .select()
      .single();

    if (appointmentError) {
      throw appointmentError;
    }

    return NextResponse.json({ appointment: appointmentData }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
