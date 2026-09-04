import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const client = new MercadoPagoConfig({ accessToken });
const preApprovalClient = new PreApproval(client);

export interface CreateSubscriptionParams {
  userId: string;
  userEmail: string;
  backUrl?: string;
  planPrice?: number;
  planTitle?: string;
}

/**
 * Crea una suscripción mensual recurrente en Mercado Pago (PreApproval)
 */
export async function createMonthlySubscription({
  userId,
  userEmail,
  backUrl,
  planPrice = Number(process.env.MERCADO_PAGO_PLAN_PRICE) || 9990,
  planTitle = process.env.MERCADO_PAGO_PLAN_TITLE || 'Membresía Mensual Hipnosis Chile',
}: CreateSubscriptionParams): Promise<{ initPoint: string; id: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const returnUrl = backUrl || `${appUrl}/suscripcion/exito`;

  // Si no hay token de Mercado Pago configurado, retornamos modo demo/sandbox
  if (!accessToken || accessToken.startsWith('TEST-0000000000000000')) {
    console.warn('[MercadoPago] Usando modo demo de suscripción (sin credenciales reales).');
    return {
      initPoint: `${appUrl}/suscripcion/demo-checkout?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail)}`,
      id: `demo_sub_${Date.now()}`,
    };
  }

  try {
    const response = await preApprovalClient.create({
      body: {
        reason: planTitle,
        payer_email: userEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planPrice,
          currency_id: 'CLP',
        },
        back_url: returnUrl,
        external_reference: userId,
        status: 'pending',
      },
    });

    return {
      initPoint: response.init_point || '',
      id: response.id || '',
    };
  } catch (error: any) {
    console.error('Error creando suscripción en Mercado Pago:', error?.message || error);
    // Fallback gracioso para desarrollo
    return {
      initPoint: `${appUrl}/suscripcion/demo-checkout?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail)}`,
      id: `fallback_${Date.now()}`,
    };
  }
}

/**
 * Consulta el estado de una suscripción en Mercado Pago
 */
export async function getSubscriptionStatus(subscriptionId: string) {
  if (!accessToken || subscriptionId.startsWith('demo_')) {
    return { status: 'authorized', external_reference: '' };
  }

  try {
    const response = await preApprovalClient.get({ id: subscriptionId });
    return response;
  } catch (err) {
    console.error('Error obteniendo estado de suscripción:', err);
    return null;
  }
}
