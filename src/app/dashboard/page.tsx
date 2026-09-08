'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getCategorias, getSesiones } from '@/lib/services/contentService';
import { Categoria, Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { FeaturedCarousel } from '@/components/sessions/FeaturedCarousel';
import { ContinueListeningRow } from '@/components/sessions/ContinueListeningRow';
import {
  Sparkles,
  ShieldCheck,
  Quote,
  Compass,
  ArrowRight,
  Headphones
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const [cats, sess] = await Promise.all([
        getCategorias(),
        getSesiones(),
      ]);
      setCategories(cats);
      setSessions(sess);
      setLoadingData(false);
    }
    loadData();
  }, []);

  const userName = user?.nombre_completo || user?.email?.split('@')[0] || 'Viajero';
  const featuredSessions = sessions.filter((s) => s.destacado);

  const continueListeningItems = sessions.slice(0, 3).map((session, idx) => ({
    session,
    progressSeconds: [320, 540, 890][idx] || 300,
  }));

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10 font-sans-persona">
      {/* 1. Header de Bienvenida Emocional */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#a55850]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#140f0e] border border-[#3b2c29] text-xs font-semibold text-[#b98d76]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a55850]" />
              <span>Membresía Ilimitada Activa • Tu Refugio Mental</span>
            </div>
            <h1 className="font-serif-persona text-2xl sm:text-4xl lg:text-5xl font-normal text-[#fbf7f4] tracking-tight">
              Bienvenido a tu santuario,{' '}
              <span className="italic text-[#d8aba1]">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a89b97] max-w-2xl font-light leading-relaxed">
              Tu mente descansa aquí. Ponte tus audífonos, respira hondo y permite que cada frecuencia y palabra disuelva la tensión acumulada.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/explorar"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-md shadow-[#a55850]/20 transition-all hover:scale-105"
            >
              <Compass className="w-3.5 h-3.5" />
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Intención del Día */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#181211] border border-[#2d2220] flex items-center gap-4">
        <Quote className="w-7 h-7 text-[#a55850]/60 shrink-0 hidden sm:block" />
        <div className="text-xs sm:text-sm text-[#a89b97] font-light">
          <strong className="text-[#fbf7f4] font-serif-persona text-sm block mb-0.5">
            Intención de Hoy:
          </strong>
          «No necesitas arreglar tu vida en una noche. Solo permítete soltar los pensamientos y entregarle este momento a tu respiración.»
        </div>
      </div>

      {/* 3. Carrusel de Sesiones Destacadas */}
      {!loadingData && featuredSessions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-persona text-xl font-normal text-[#fbf7f4]">
              Destacadas para Ti
            </h3>
            <span className="text-xs text-[#b98d76]">Seleccionadas por especialistas</span>
          </div>
          <FeaturedCarousel sessions={featuredSessions} />
        </section>
      )}

      {/* 4. Continuar Escuchando (Scroll Horizontal) */}
      {!loadingData && continueListeningItems.length > 0 && (
        <section>
          <ContinueListeningRow items={continueListeningItems} />
        </section>
      )}

      {/* 5. Catálogo Completo / Consultas reales */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#b98d76] uppercase tracking-widest block mb-0.5">
              Toda la Biblioteca
            </span>
            <h2 className="font-serif-persona text-xl sm:text-2xl font-normal text-[#fbf7f4]">
              Sesiones de Sanación y Reprogramación
            </h2>
          </div>
          <Link
            href="/explorar"
            className="flex items-center gap-1 text-xs text-[#b98d76] hover:text-[#d8aba1] font-medium transition-colors"
          >
            Ver por categoría <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-[#1e1716] border border-[#2d2220] animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
            <Headphones className="w-12 h-12 mx-auto text-[#b98d76] opacity-60" />
            <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
              No hay sesiones disponibles aún
            </h3>
            <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light leading-relaxed">
              Pronto se publicarán nuevas inducciones y frecuencias de bienestar. Revisa nuevamente más tarde o visita el panel de administración para agregarlas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
