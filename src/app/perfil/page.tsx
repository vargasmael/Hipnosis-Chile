'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  LogOut,
  Shield,
  ExternalLink,
  History,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const { user, signOut, setDemoUser } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-white mb-2">No has iniciado sesión</h2>
        <p className="text-xs text-slate-400 mb-4">Inicia sesión para acceder a los detalles de tu cuenta.</p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-xs"
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
    }, 1000);
  };

  const handleReactivate = () => {
    router.push('/suscripcion');
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Mi Cuenta
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gestiona los datos de tu perfil y el estado de tu suscripción digital.
        </p>
      </div>

      {/* Tarjeta de Usuario */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-lg font-bold text-white truncate">
            {user.nombre_completo || 'Suscriptor Hipnosis Chile'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                isActiva
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isActiva ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Membresía Activa
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Suscripción Inactiva
                </>
              )}
            </span>

            {user.rol === 'admin' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Shield className="w-3.5 h-3.5" /> Administrador
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Gestión de Membresía (Mercado Pago) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Detalles de Suscripción</h3>
          </div>
          <span className="text-xs text-slate-400">Procesado vía Mercado Pago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block">Plan Contratado</span>
            <span className="font-bold text-white text-sm">Streaming Ilimitado</span>
            <span className="text-indigo-400 font-semibold block">$9.990 CLP / mes</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block">ID de Suscripción MP</span>
            <span className="font-mono text-slate-300 truncate block">
              {user.id_suscripcion_mercadopago || 'mp_sub_123456789'}
            </span>
            <span className="text-slate-500 text-[10px]">Cobro recurrente mensual</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 block">Próxima Renovación</span>
            <span className="font-bold text-white text-sm">En 30 días</span>
            <span className="text-slate-400 text-[10px]">Renovación automática</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isActiva ? (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Cancelar o pausar suscripción
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Reactivar Membresía
            </button>
          )}

          <a
            href="https://www.mercadopago.cl/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Ver mis suscripciones en Mercado Pago <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Historial & Estadísticas */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Tu Actividad de Bienestar</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-2xl font-extrabold text-white">12</span>
            <span className="text-xs text-slate-400 block mt-1">Sesiones escuchadas</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-2xl font-extrabold text-indigo-400">180</span>
            <span className="text-xs text-slate-400 block mt-1">Minutos de relajación</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-2xl font-extrabold text-teal-400">8</span>
            <span className="text-xs text-slate-400 block mt-1">Noches de sueño profundo</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-2xl font-extrabold text-purple-400">5</span>
            <span className="text-xs text-slate-400 block mt-1">Favoritos guardados</span>
          </div>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-red-400 font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Cancelación de Suscripción */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">¿Deseas cancelar tu membresía?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Al cancelar, mantendrás acceso hasta el final del periodo pagado. No se te volverán a cobrar $9.990 CLP el próximo mes. Puedes reactivarla cuando gustes.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Mantener mi suscripción
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
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
