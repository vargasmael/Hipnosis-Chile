'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, Headphones, ArrowRight, Sparkles } from 'lucide-react';

export default function SuscripcionExitoPage() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
            ¡Pago Aprobado!
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bienvenido a Hipnosis Chile
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tu suscripción mensual ya está activa. Tienes acceso inmediato e ilimitado a todas las sesiones de hipnosis clínica y relajación.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
          <div className="flex justify-between">
            <span>Usuario:</span>
            <span className="text-white font-medium">{user?.email || 'suscriptor@hipnosischile.cl'}</span>
          </div>
          <div className="flex justify-between">
            <span>Estado:</span>
            <span className="text-teal-400 font-semibold">Membresía Activa</span>
          </div>
          <div className="flex justify-between">
            <span>Próxima renovación:</span>
            <span className="text-white font-medium">En 30 días</span>
          </div>
        </div>

        <Link
          href="/biblioteca"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Headphones className="w-4 h-4" />
          Ir a la Biblioteca de Sesiones
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
