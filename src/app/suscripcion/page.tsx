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

import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { VSLPlayer } from '@/components/video/VSLPlayer';

export default function SuscripcionPage() {
  const router = useRouter();
  const { user, setDemoUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  // 1. Activar Membresía / Simular Pago Exitoso en Firestore
  const handleActivateMembership = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Obtener el UID del usuario logueado actualmente (auth.currentUser)
      const currentUser = auth.currentUser;
      const uid = currentUser?.uid || user?.id;

      if (!uid) {
        router.push('/login?redirect=/suscripcion');
        return;
      }

      // Actualizar su documento en la colección 'usuarios' de Firestore, cambiando estado_suscripcion a "activa"
      const userRef = doc(db, 'usuarios', uid);
      await setDoc(
        userRef,
        {
          uid,
          id: uid,
          email: currentUser?.email || user?.email || '',
          estado_suscripcion: 'activa',
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      // Sincronizar cookies de sesión para que el Middleware permita paso a /dashboard
      if (typeof document !== 'undefined') {
        document.cookie = `reprograma_auth=true; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `reprograma_sub=activa; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `reprograma_role=${user?.rol || 'user'}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `reprograma_user_id=${uid}; path=/; max-age=2592000; SameSite=Lax`;
      }

      // Sincronizar estado en el contexto de autenticación
      setDemoUser('activa', user?.rol || 'user');
      await refreshUser();

      setSimulatedSuccess(true);

      // Al completar la actualización, redirige automáticamente a /dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Error al actualizar membresía en Firestore:', err);
      setErrorMsg('Error al activar la suscripción en Firestore: ' + (err?.message || 'Inténtalo de nuevo'));
    } finally {
      setLoading(false);
    }
  };

  // Preparación para Checkout directo de Mercado Pago
  const handleMercadoPagoCheckout = async () => {
    const currentUser = auth.currentUser;
    const uid = currentUser?.uid || user?.id;

    if (!uid) {
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
          userId: uid,
          userEmail: currentUser?.email || user?.email,
        }),
      });

      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        // Fallback inmediato a simulación exitosa en desarrollo
        await handleActivateMembership();
      }
    } catch (err: any) {
      console.warn('Fallback a simulación de pago:', err);
      await handleActivateMembership();
    } finally {
      setLoading(false);
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

      {/* 2. Video de Presentación Pre-Suscripción (VSL) */}
      <div className="w-full max-w-2xl mb-10">
        <VSLPlayer
          badgeText="Carta de Presentación del Especialista"
          title="Escucha esto antes de tomar una decisión"
          subtitle="Una breve introducción al método de hipnosis y reprogramación subconsciente que experimentarás dentro del refugio."
        />
      </div>

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

        {/* Botón Principal: Simular Pago Exitoso / Activar Membresía en Firestore */}
        <button
          onClick={handleActivateMembership}
          disabled={loading || simulatedSuccess}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-sm shadow-xl shadow-[#a55850]/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border border-[#a55850]"
        >
          {loading ? (
            'Activando suscripción en Firestore...'
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#ffd7ce]" />
              <span>Activar Membresía ($9.990 CLP / Simular Pago)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-[#7d6f6b]">
          <Lock className="w-3.5 h-3.5 text-[#b98d76]" />
          <span>Activación inmediata en Firestore • Preparado para Mercado Pago</span>
        </div>

        {/* Opción alternativa / Pasarela Mercado Pago */}
        <div className="pt-4 border-t border-[#2d2220] space-y-2">
          <button
            onClick={handleMercadoPagoCheckout}
            disabled={loading || simulatedSuccess}
            className="w-full py-3 px-4 rounded-full bg-[#1e1716] hover:bg-[#281e1c] text-[#d8aba1] hover:text-[#fbf7f4] border border-[#a55850]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-[#a55850] active:scale-95 shadow-md"
          >
            <CreditCard className="w-4 h-4 text-[#a55850]" />
            <span>Pagar con Mercado Pago Oficial</span>
          </button>
          <p className="text-[10px] text-[#7d6f6b] text-center font-light">
            Al hacer clic en el botón principal, tu UID se actualiza en la colección <code>usuarios</code> a <strong>activa</strong> y entrarás de inmediato a tu <code>/dashboard</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
