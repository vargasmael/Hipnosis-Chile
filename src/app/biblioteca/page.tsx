'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCategorias, getSesiones } from '@/lib/services/contentService';
import { Categoria, Sesion } from '@/types/database';
import { FeaturedCarousel } from '@/components/sessions/FeaturedCarousel';
import { ContinueListeningRow } from '@/components/sessions/ContinueListeningRow';
import { CategoryPills } from '@/components/sessions/CategoryPills';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Sparkles, Search, Filter, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function BibliotecaPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [cats, sess] = await Promise.all([
          getCategorias(),
          getSesiones(),
        ]);
        setCategories(cats);
        setSessions(sess);
      } catch (err) {
        console.warn('Error cargando biblioteca en Firestore:', err);
        setCategories([]);
        setSessions([]);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const featuredSessions = sessions.filter((s) => s.destacado);

  // Muestra de sesiones en progreso (por ejemplo si el usuario ya inició alguna)
  const continueItems = sessions.slice(0, 2).map((session, index) => ({
    session,
    progressSeconds: index === 0 ? 420 : 180,
  }));

  const filteredSessions = sessions.filter((session) => {
    const matchesCategory = selectedCategory ? session.id_categoria === selectedCategory : true;
    const matchesSearch = searchQuery
      ? session.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10 font-sans-persona">
      {/* Banner de aviso si el usuario no tiene la membresía activa */}
      {user && user.estado_suscripcion !== 'activa' && (
        <div className="p-4 rounded-2xl bg-[#241816] border border-[#a55850]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#d8aba1] text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#a55850] shrink-0" />
            <span>
              Tu membresía se encuentra <strong className="text-white">inactiva</strong>. Actívala para disfrutar de reproducción ilimitada sin restricciones.
            </span>
          </div>
          <Link
            href="/suscripcion"
            className="shrink-0 px-4 py-1.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-bold transition-colors shadow-md shadow-[#a55850]/20"
          >
            Activar Ahora
          </Link>
        </div>
      )}

      {/* Hero Carrusel de Sesiones Destacadas */}
      {!selectedCategory && !searchQuery && featuredSessions.length > 0 && (
        <FeaturedCarousel sessions={featuredSessions} />
      )}

      {/* Fila de Continuar Escuchando */}
      {!selectedCategory && !searchQuery && (
        <ContinueListeningRow items={continueItems} />
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif-persona text-2xl sm:text-3xl font-normal text-[#fbf7f4] tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.nombre || 'Categoría'
              : 'Todas las Sesiones'}
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89b97]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema o síntoma..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#1e1716] border border-[#3b2c29] text-xs text-[#ece5e2] placeholder-[#7d6f6b] focus:outline-none focus:border-[#a55850] transition-colors"
            />
          </div>
        </div>

        {/* Chips de Categorías */}
        <CategoryPills
          categories={categories}
          selectedId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Cuadrícula de Sesiones */}
      {loadingData ? (
        <div className="py-20 text-center text-[#a89b97] text-sm font-light">
          Cargando biblioteca de hipnosis...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-16 text-center bg-[#1e1716] rounded-3xl border border-[#3b2c29] p-8 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-[#b98d76] opacity-80 mb-2" />
          <p className="font-serif-persona text-xl text-[#fbf7f4]">No se encontraron sesiones con ese criterio</p>
          <p className="text-xs text-[#a89b97] mt-1 font-light">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-xs font-medium text-white transition-all shadow-md shadow-[#a55850]/20"
          >
            Ver todas las sesiones
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
