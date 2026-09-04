'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, ArrowRight } from 'lucide-react';

function DemoCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDemoUser } = useAuth();
  const [processing, setProcessing] = useState(false);

  const email = searchParams.get('email') || 'suscriptor@hipnosischile.cl';

  const handleConfirm = async () => {
    setProcessing(true);

    try {
      await fetch('/api/webhooks/mercadopago?type=subscription_preapproval&data.id=demo_sub_approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription_preapproval',
          data: { id: 'demo_sub_approved' },
        }),
      });
    } catch {
      // ignore
    }

    setDemoUser('activa', 'user');

    setTimeout(() => {
      router.push('/suscripcion/exito');
    }, 800);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl">
          MP
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Mercado Pago Checkout (Sandbox)</h2>
          <p className="text-xs text-slate-400">Pasarela de cobro recurrente simulada</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Concepto:</span>
          <span className="font-semibold text-white">Membresía Hipnosis Chile</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Frecuencia:</span>
          <span className="font-semibold text-white">Mensual automática</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Comprador:</span>
          <span className="font-semibold text-slate-300 truncate max-w-[200px]">{email}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-slate-800">
          <span className="font-bold text-white">Total a pagar:</span>
          <span className="font-extrabold text-teal-400 text-lg">$9.990 CLP</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={processing}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {processing ? 'Autorizando pago...' : 'Simular Pago Exitoso'}
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-slate-500 text-center">
        Esta pantalla simula el flujo de redirección oficial de Mercado Pago para pruebas antes de configurar credenciales en producción.
      </p>
    </div>
  );
}

export default function DemoCheckoutPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Cargando pasarela...</div>}>
        <DemoCheckoutContent />
      </Suspense>
    </div>
  );
}
