'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFavoritos } from '@/lib/services/contentService';
import { Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import {
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Shield,
  ExternalLink,
  History,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const { user, signOut, setDemoUser } = useAuth();
  const [favoriteSessions, setFavoriteSessions] = useState<Sesion[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadFavs() {
      setLoadingFavorites(true);
      const favs = await getFavoritos();
      setFavoriteSessions(favs);
      setLoadingFavorites(false);
    }
    loadFavs();

    const handleUpdate = () => {
      loadFavs();
    };
    window.addEventListener('reprograma_favoritos_updated', handleUpdate);
    return () => window.removeEventListener('reprograma_favoritos_updated', handleUpdate);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 font-sans-persona">
        <h2 className="font-serif-persona text-2xl font-normal text-[#fbf7f4] mb-2">No has iniciado sesión</h2>
        <p className="text-xs text-[#a89b97] mb-4">Inicia sesión para acceder a tu perfil y membresía.</p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-[#a55850] text-white font-medium text-xs shadow-lg shadow-[#a55850]/20"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const isActiva = user.estado_suscripcion === 'activa';

  const handleCancelSubscription = () => {
    setCancelling(true);
    setTimeout(() => {
      setDemoUser('inactiva', user.rol);
      setCancelling(false);
      setShowCancelModal(false);
    }, 800);
  };

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8 font-sans-persona">
      <div>
        <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
          Mi Cuenta & Membresía
        </h1>
        <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
          Administra tu suscripción digital a Re-Programa y tus sesiones favoritas.
        </p>
      </div>

      {/* Tarjeta de Usuario */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-2xl">
        <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#a55850] to-[#b98d76] flex items-center justify-center text-white text-2xl font-serif-persona shrink-0 shadow-lg shadow-[#a55850]/30 border border-[#3b2c29]">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="font-serif-persona text-xl sm:text-2xl text-[#fbf7f4] truncate">
            {user.nombre_completo || 'Suscriptor Re-Programa'}
          </h2>
          <p className="text-xs text-[#a89b97] mt-0.5">{user.email}</p>
          <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium ${
                isActiva
                  ? 'bg-[#a55850]/15 text-[#d8aba1] border border-[#a55850]/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isActiva ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a55850]" /> Membresía Ilimitada Activa
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Suscripción Inactiva
                </>
              )}
            </span>

            {user.rol === 'admin' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#b98d76]/20 text-[#b98d76] border border-[#b98d76]/30">
                <Shield className="w-3.5 h-3.5" /> Administrador
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Gestión de Membresía (Mercado Pago) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2d2220] pb-4">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#b98d76]" />
            <h3 className="font-serif-persona text-lg text-[#fbf7f4]">Estado de la Membresía</h3>
          </div>
          <span className="text-[11px] text-[#9c8e8a]">Procesado vía Mercado Pago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-1">
            <span className="text-[#7d6f6b] block">Plan Contratado</span>
            <span className="font-medium text-[#fbf7f4] text-sm">Streaming Ilimitado Re-Programa</span>
            <span className="text-[#b98d76] font-semibold block">$9.990 CLP / mes</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-1">
            <span className="text-[#7d6f6b] block">ID de Suscripción</span>
            <span className="font-mono text-[#c7b9b4] truncate block">
              {user.id_suscripcion_mercadopago || 'mp_sub_reprograma_001'}
            </span>
            <span className="text-[#7d6f6b] text-[10px]">Cobro mensual automático</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-1">
            <span className="text-[#7d6f6b] block">Próxima Renovación</span>
            <span className="font-medium text-[#fbf7f4] text-sm">En 30 días</span>
            <span className="text-[#7d6f6b] text-[10px]">Sin permanencia mínima</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isActiva ? (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-[#a89b97] hover:text-red-400 transition-colors"
            >
              Cancelar o pausar suscripción
            </button>
          ) : (
            <Link
              href="/suscripcion"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-xs tracking-wide shadow-lg shadow-[#a55850]/20 text-center transition-all"
            >
              Reactivar Membresía
            </Link>
          )}

          <a
            href="https://www.mercadopago.cl/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#b98d76] hover:text-[#d8aba1] font-medium"
          >
            Ver en Mercado Pago <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mis Favoritos Guardados */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2d2220] pb-4">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#a55850] fill-current" />
            <h3 className="font-serif-persona text-lg text-[#fbf7f4]">Tus Sesiones Favoritas</h3>
          </div>
          <Link
            href="/favoritos"
            className="flex items-center gap-1 text-xs text-[#b98d76] hover:text-[#d8aba1] font-medium"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingFavorites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-[#140f0e] border border-[#2d2220] animate-pulse" />
            ))}
          </div>
        ) : favoriteSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteSessions.slice(0, 4).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                variant="horizontal"
                isInitiallyFavorited={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#a89b97]">
            Aún no has añadido sesiones a tus favoritos.
          </div>
        )}
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e1716] hover:bg-[#251d1c] border border-[#3b2c29] text-xs text-[#a89b97] hover:text-red-400 font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Cancelación de Suscripción */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl space-y-4">
            <h3 className="font-serif-persona text-xl text-[#fbf7f4]">¿Deseas pausar tu membresía?</h3>
            <p className="text-xs text-[#c7b9b4] leading-relaxed font-light">
              Al cancelar, mantendrás acceso hasta el final de tu ciclo de facturación. No se te volverán a cobrar $9.990 CLP el próximo mes.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2220]">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-full bg-[#140f0e] text-xs text-[#ece5e2] hover:bg-[#251d1c] border border-[#3b2c29]"
              >
                Mantener mi membresía
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs transition-colors"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
