import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Hacer una consulta simple para mantener Supabase activo
    const { error } = await supabase.from('perfiles').select('id').limit(1);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase activo ✅',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
