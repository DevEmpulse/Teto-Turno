import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*, services(*), staff(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404, headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CACHE_HEADERS }
    );
  }

  return NextResponse.json(data, { status: 200, headers: CACHE_HEADERS });
}
