import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ user: null, perfil: null });

    const admin = await createAdminClient();
    const { data: perfil } = await admin
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ user, perfil });
  } catch {
    return NextResponse.json({ user: null, perfil: null });
  }
}
