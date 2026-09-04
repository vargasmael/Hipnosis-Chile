import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSubscriptionStatus } from '@/lib/mercadopago/client';

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const body = await req.json().catch(() => ({}));

    // Mercado Pago puede enviar el tipo e id por query param o en el body
    const type = searchParams.get('type') || body.type || body.action;
    const dataId = searchParams.get('data.id') || body.data?.id || body.id;

    console.log(`[Webhook Mercado Pago] Recibido evento: type=${type}, id=${dataId}`);

    if (!dataId) {
      return NextResponse.json({ received: true, note: 'No dataId provided' }, { status: 200 });
    }

    const supabase = createAdminClient();

    // 1. Notificación de PreApproval / Suscripción
    if (type === 'subscription_preapproval' || type === 'preapproval' || !type) {
      const sub = await getSubscriptionStatus(dataId);
      if (sub && sub.external_reference) {
        const userId = sub.external_reference;
        const mpStatus = sub.status; // 'authorized', 'paused', 'cancelled', 'pending'

        let nuevoEstado = 'inactiva';
        if (mpStatus === 'authorized') {
          nuevoEstado = 'activa';
        } else if (mpStatus === 'cancelled') {
          nuevoEstado = 'cancelada';
        } else if (mpStatus === 'pending') {
          nuevoEstado = 'pendiente';
        }

        console.log(`[Webhook Mercado Pago] Actualizando usuario ${userId} a estado_suscripcion=${nuevoEstado}`);

        const { error } = await supabase
          .from('usuarios')
          .update({
            estado_suscripcion: nuevoEstado,
            id_suscripcion_mercadopago: dataId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('[Webhook] Error actualizando Supabase:', error);
        }
      }
    }

    // 2. Notificación directa de pago puntual (payment) si aplica
    if (type === 'payment') {
      // Si se implementara pago manual por mes
      console.log(`[Webhook Mercado Pago] Notificación de pago puntual: ${dataId}`);
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Error procesando webhook de Mercado Pago:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno en webhook' },
      { status: 500 }
    );
  }
}

// Permitir verificación GET si Mercado Pago hace ping
export async function GET() {
  return NextResponse.json({ status: 'active', service: 'Hipnosis Chile Mercado Pago Webhook' });
}
