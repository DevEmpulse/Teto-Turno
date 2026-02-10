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
        customers (
          full_name,
          email,
          phone
        ),
        services (
          name,
          price
        ),
        staff (
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
  // 1. Cliente Normal (solo para ver si el usuario tiene cuenta en la App)
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
      // Mapeo de variables (Frontend -> Backend)
      name: name,
      email: email,
      phone: phone,
    } = body;

    // Validación básica
    if (!business_id || !scheduled_at || !duration_minutes) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    const startDate = new Date(scheduled_at);
    const endDate = new Date(startDate.getTime() + duration_minutes * 60000);

    // --------------------------------------------------------------------------
    // INICIO: LÓGICA CRM (Find, Update or Create)
    // --------------------------------------------------------------------------

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Falta configuración del servidor (SUPABASE_SERVICE_ROLE_KEY)');
    }

    // Cliente Admin para poder escribir en 'customers' sin restricciones
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    let customerId = null;

    // PASO A: Buscar si el cliente ya existe (por email)
    if (email) {
      const { data: existingCustomer } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('business_id', business_id)
        .eq('email', email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;

        // --- 🚀 LA MEJORA CLAVE: ACTUALIZAR DATOS ---
        // Si ya existe, actualizamos su nombre y teléfono con lo último que escribió
        if (name || phone) {
          await supabaseAdmin
            .from('customers')
            .update({
              full_name: name, // Actualizamos el nombre (ej: "Agus" -> "Agustín")
              phone: phone, // Actualizamos el teléfono
            })
            .eq('id', customerId);
        }
        // ---------------------------------------------
      }
    }

    // PASO B: Si NO existe, lo creamos desde cero
    if (!customerId && (name || email)) {
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('customers')
        .insert([
          {
            business_id,
            full_name: name || 'Cliente Sin Nombre',
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
    // FIN LÓGICA CRM
    // --------------------------------------------------------------------------

    // 2. Insertamos la Cita
    const { data: appointmentData, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([
        {
          business_id,
          staff_id,
          service_id,
          client_id: user?.id || null, // Usuario App
          customer_id: customerId, // Ficha CRM (¡Ahora actualizada!)
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
