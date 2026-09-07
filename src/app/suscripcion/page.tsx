'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  AlertCircle,
  Heart,
  Feather,
  Check
} from 'lucide-react';

export default function SuscripcionPage() {
  const router = useRouter();
  const { user, setDemoUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  // Pago real con Mercado Pago
  const handleCheckout = async () => {
    if (!user) {
      router.push('/login?redirect=/suscripcion');
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
        setErrorMsg('No se pudo generar el enlace de pago de Mercado Pago.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al conectar con la pasarela de pagos');
    } finally {
      setLoading(false);
    }
  };

  // Botón de Pago Simulado que actualiza el estado en la base de datos / cookies y da acceso inmediato al Dashboard
  const handleSimulatePayment = async () => {
    setSimulating(true);
    setErrorMsg(null);

    try {
      const userId = user?.id || `usr_${Date.now()}`;
      
      // Llamada al endpoint para actualizar estado en base de datos y cookies del servidor
      await fetch('/api/suscripcion/simular-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          estado: 'activa',
        }),
      });

      // Actualizar estado del contexto de autenticación
      setDemoUser('activa', user?.rol || 'user');
      setSimulatedSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMsg('Error al simular pago: ' + (err?.message || 'Inténtalo de nuevo'));
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center font-sans-persona">
      {/* Cabecera Empática del Muro de Pago */}
      <div className="text-center max-w-2xl mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[#b98d76] text-xs font-semibold">
          <Feather className="w-3.5 h-3.5 text-[#a55850]" />
          <span>Acceso Exclusivo al Refugio</span>
        </div>
        <h1 className="font-serif-persona text-3xl sm:text-5xl font-normal text-[#fbf7f4] tracking-tight">
          Tu paz mental no es un gasto,{' '}
          <span className="italic text-[#d8aba1]">es tu mayor prioridad.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#a89b97] font-light leading-relaxed max-w-xl mx-auto">
          Para abrir las puertas de este refugio privado y acceder ilimitadamente a todas las sesiones guiadas, inducciones para el sueño y reprogramación, activa tu membresía mensual.
        </p>
      </div>

      {errorMsg && (
        <div className="w-full max-w-md p-3.5 mb-6 rounded-2xl bg-[#2b1716] border border-[#a55850]/40 flex items-center gap-2.5 text-xs text-[#d8aba1]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#a55850]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {simulatedSuccess && (
        <div className="w-full max-w-md p-4 mb-6 rounded-2xl bg-[#1e281d] border border-teal-500/40 flex items-center gap-3 text-xs text-teal-300 animate-in fade-in">
          <Check className="w-5 h-5 text-teal-400 shrink-0" />
          <span>
            <strong>¡Pago simulado exitoso!</strong> Tu suscripción ha sido activada. Redirigiéndote a tu Dashboard...
          </span>
        </div>
      )}

      {/* Tarjeta de Checkout estilo Persona */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#1c1514] border-2 border-[#a55850]/50 shadow-2xl space-y-7 relative backdrop-blur-md">
        <div className="flex items-center justify-between pb-5 border-b border-[#2d2220]">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#b98d76]">
              Plan Único Ilimitado
            </span>
            <h3 className="font-serif-persona text-xl font-normal text-[#fbf7f4]">
              Membresía Re-Programa
            </h3>
          </div>
          <div className="text-right">
            <span className="font-serif-persona text-3xl sm:text-4xl font-normal text-[#fbf7f4]">$9.990</span>
            <span className="text-xs text-[#a89b97] block">CLP / mes</span>
          </div>
        </div>

        {/* Lista de Beneficios del Muro de Pago */}
        <ul className="space-y-3.5 text-xs sm:text-sm text-[#ece5e2]">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76] shrink-0" />
            <span>Acceso ilimitado 24/7 a toda la biblioteca de audio y video</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76] shrink-0" />
            <span>Reproducción nocturna con celular bloqueado y pantalla apagada</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76] shrink-0" />
            <span>Nuevas inducciones y sesiones añadidas continuamente</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#b98d76] shrink-0" />
            <span>Libertad absoluta: cancela con 1 solo clic cuando desees</span>
          </li>
        </ul>

        {/* Botón de Pago Real con Mercado Pago */}
        <button
          onClick={handleCheckout}
          disabled={loading || simulating || simulatedSuccess}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-sm shadow-xl shadow-[#a55850]/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border border-[#a55850]"
        >
          {loading ? 'Conectando con Mercado Pago...' : 'Activar con Mercado Pago ($9.990 CLP)'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-[#7d6f6b]">
          <Lock className="w-3.5 h-3.5 text-[#b98d76]" />
          <span>Cobro seguro y encriptado por Mercado Pago</span>
        </div>

        {/* BOTÓN DE PAGO SIMULADO (Requisito Explícito) */}
        <div className="pt-6 border-t border-[#2d2220] space-y-2">
          <div className="text-center">
            <span className="text-[11px] text-[#b98d76] font-medium block">
              Entorno de Pruebas / Desarrollo:
            </span>
          </div>
          <button
            onClick={handleSimulatePayment}
            disabled={simulating || simulatedSuccess}
            className="w-full py-3 px-4 rounded-full bg-[#1e1716] hover:bg-[#281e1c] text-[#d8aba1] hover:text-[#fbf7f4] border border-[#a55850]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-[#a55850] active:scale-95 shadow-md"
          >
            <Zap className="w-4 h-4 text-[#a55850]" />
            {simulating ? 'Actualizando base de datos...' : 'Simular Pago Exitoso (Activación Inmediata)'}
          </button>
          <p className="text-[10px] text-[#7d6f6b] text-center font-light">
            Actualiza el estado a <strong>'activa'</strong> en la base de datos y te da acceso inmediato a <code>/dashboard</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
