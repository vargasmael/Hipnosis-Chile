import { NextRequest, NextResponse } from 'next/server';
import { createMonthlySubscription } from '@/lib/mercadopago/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, backUrl } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'userId y userEmail son requeridos' },
        { status: 400 }
      );
    }

    const { initPoint, id } = await createMonthlySubscription({
      userId,
      userEmail,
      backUrl,
    });

    return NextResponse.json({ initPoint, subscriptionId: id });
  } catch (error: any) {
    console.error('Error en API create-subscription:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al generar suscripción' },
      { status: 500 }
    );
  }
}
