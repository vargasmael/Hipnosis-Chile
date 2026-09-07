import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, estado = 'activa' } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // Si Supabase está configurado con credenciales reales, actualizar la base de datos
    if (supabaseUrl && !supabaseUrl.includes('placeholder') && userId) {
      const supabase = createAdminClient();
      await supabase
        .from('usuarios')
        .update({
          estado_suscripcion: estado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    const response = NextResponse.json({
      success: true,
      estado_suscripcion: estado,
      message: 'Membresía activada exitosamente en modo demostración/simulado.',
    });

    // Fijar cookies para que el middleware de Next.js reconozca la suscripción activa
    response.cookies.set('reprograma_auth', 'true', {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });
    response.cookies.set('reprograma_sub', estado, {
      path: '/',
      maxAge: 2592000,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Error simulando pago' },
      { status: 500 }
    );
  }
}
