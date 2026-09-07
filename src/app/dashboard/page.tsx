'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCategorias, getSesiones } from '@/lib/services/contentService';
import { Categoria, Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { CategoryPills } from '@/components/sessions/CategoryPills';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Moon,
  HeartHandshake,
  Brain,
  Headphones,
  Compass,
  ArrowRight,
  ShieldCheck,
  User,
  Quote
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const userName = user?.nombre_completo || user?.email?.split('@')[0] || 'Miembro';
  const featuredSessions = sessions.filter((s) => s.destacado);

  const filteredSessions = sessions.filter((session) => {
    const matchesCategory = selectedCategory ? session.id_categoria === selectedCategory : true;
    const matchesSearch = searchQuery
      ? session.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-36 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 font-sans-persona">
      {/* 1. Header de Bienvenida Emocional */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#a55850]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#140f0e] border border-[#3b2c29] text-xs font-semibold text-[#b98d76]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a55850]" />
              <span>Membresía Ilimitada Activa  Tu Refugio Mental</span>
            </div>
            <h1 className="font-serif-persona text-3xl sm:text-5xl font-normal text-[#fbf7f4] tracking-tight">
              Bienvenido a tu refugio,{' '}
              <span className="italic text-[#d8aba1]">{userName}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#a89b97] max-w-2xl font-light leading-relaxed">
              Tu mente está a salvo aquí. Ponte tus audífonos, respira profundo y elige la sesión que necesitas para calmar tu día o inducir un descanso reparador.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/perfil"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#140f0e] hover:bg-[#251d1c] border border-[#3b2c29] text-xs font-medium text-[#ece5e2] transition-colors"
            >
              <User className="w-4 h-4 text-[#b98d76]" />
              Mi Cuenta
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Cita o Intención del Día */}
      <div className="p-6 rounded-3xl bg-[#181211] border border-[#2d2220] flex items-center gap-4 text-left">
        <Quote className="w-8 h-8 text-[#a55850]/50 shrink-0 hidden sm:block" />
        <div className="text-xs sm:text-sm text-[#a89b97] font-light">
          <strong className="text-[#fbf7f4] font-serif-persona text-sm block mb-0.5">
            Intención del Momento:
          </strong>
          «No necesitas solucionar todo hoy. Permítete soltar la tensión de las últimas horas; el descanso también es progreso.»
        </div>
      </div>

      {/* 3. Filtros por Categoría */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#b98d76] uppercase tracking-widest block mb-1">
              Catálogo de Sanación & Reprogramación
            </span>
            <h2 className="font-serif-persona text-2xl sm:text-3xl font-normal text-[#fbf7f4]">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.nombre || 'Categoría'
                : 'Todas las Sesiones'}
            </h2>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89b97]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por síntoma o emoción..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[#ece5e2] placeholder-[#7d6f6b] text-xs focus:outline-none focus:border-[#a55850] transition-colors"
            />
          </div>
        </div>

        {/* Píldoras de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
              selectedCategory === null
                ? 'bg-[#a55850] text-white shadow-md shadow-[#a55850]/20'
                : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#a55850] text-white shadow-md shadow-[#a55850]/20'
                    : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
                }`}
              >
                {cat.nombre}
              </button>
            );
          })}
        </div>

        {/* Grilla de Sesiones */}
        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-[#1e1716] border border-[#2d2220] animate-pulse" />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-[#1e1716] border border-[#2d2220]">
            <Sparkles className="w-8 h-8 text-[#b98d76] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif-persona text-lg text-[#fbf7f4]">
              No se encontraron sesiones para esta búsqueda
            </h3>
            <p className="text-xs text-[#a89b97] mt-1 font-light">
              Prueba buscando por "estrés", "sueño", "calma" o desmarca los filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
