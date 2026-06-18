import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const admin = await createAdminClient();
    const { data: perfil } = await admin.from('perfiles').select('exportaciones_pdf, es_premium').eq('id', user.id).single();

    if (perfil?.es_premium) return NextResponse.json({ ok: true });

    const nuevasExportaciones = (perfil?.exportaciones_pdf || 0) + 1;
    await admin.from('perfiles').update({ exportaciones_pdf: nuevasExportaciones }).eq('id', user.id);

    return NextResponse.json({ ok: true, exportaciones_pdf: nuevasExportaciones });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
