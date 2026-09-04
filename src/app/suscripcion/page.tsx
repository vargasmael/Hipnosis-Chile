'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function SuscripcionPage() {
  const router = useRouter();
  const { user, setDemoUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/mercadopago/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setErrorMsg('No se pudo generar el enlace de pago.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al conectar con la pasarela de pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    setDemoUser('activa', user?.rol || 'user');
    router.push('/suscripcion/exito');
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center">
      <div className="text-center max-w-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acceso Ilimitado Streaming</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Activa tu Membresía Mensual
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {user
            ? `Estás suscrito como ${user.email}. Completa el pago para desbloquear toda la biblioteca de hipnosis.`
            : 'Inicia sesión o crea una cuenta para suscribirte al plan mensual.'}
        </p>
      </div>

      {errorMsg && (
        <div className="w-full max-w-md p-3 mb-6 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tarjeta de Checkout */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              Plan Mensual
            </span>
            <h3 className="text-lg font-bold text-white">Membresía Hipnosis Chile</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-white">$9.990</span>
            <span className="text-xs text-slate-400 block">CLP / mes</span>
          </div>
        </div>

        <ul className="space-y-3 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Acceso 24/7 a audios y videos de hipnosis clínica</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Reproducción en segundo plano (pantalla apagada)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Auto-guardado de progreso y favoritos</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Cancela cuando quieras sin compromisos</span>
          </li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Procesando con Mercado Pago...' : 'Pagar con Mercado Pago'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Cobro seguro y automático gestionado por Mercado Pago</span>
        </div>

        {/* Botón de Simulación para Demostración */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={handleSimulatePayment}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Zap className="w-4 h-4 text-teal-400" />
            Simular Pago Aprobado (Modo Pruebas / Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
