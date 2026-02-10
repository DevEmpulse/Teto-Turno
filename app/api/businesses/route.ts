import { NextResponse } from 'next/server';
// Asegúrate de que esta ruta apunte a donde guardaste tu archivo server.ts
import { createClient } from '@/infrastructure/supabase/server';

export async function GET() {
  // 1. Iniciamos el cliente de Supabase (usando tus cookies automáticamente)
  const supabase = await createClient();

  // 2. Hacemos la consulta a la base de datos (Tabla 'businesses')
  const { data: businesses, error } = await supabase.from('businesses').select('*');

  // 3. Si hay error, devolvemos un código 500 (Error del servidor)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Si todo sale bien, devolvemos los datos en formato JSON
  return NextResponse.json({ businesses }, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, description } = body;

    // 2. Generar Slug simple (limpiamos espacios y caracteres raros)
    // En producción, podrías usar una librería como 'slugify'
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 3. Insertar en la Base de Datos
    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          owner_id: user.id, // ¡Importante! Vinculamos al usuario actual
          name,
          slug, // El link público (teto.app/slug)
          type: type || 'other', // barbershop, salon, etc.
          description,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      // Si el slug ya existe (ej: dos negocios "Barberia Pepe"), Supabase dará error
      if (error.code === '23505') {
        // Código de error de duplicado en Postgres
        return NextResponse.json(
          { error: 'Ya existe un negocio con ese nombre/URL. Prueba otro.' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ business: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
