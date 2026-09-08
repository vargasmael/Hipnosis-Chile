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
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      {/* Banner de aviso si el usuario no tiene la membresía activa */}
      {user && user.estado_suscripcion !== 'activa' && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Tu membresía se encuentra <strong>inactiva</strong>. Actívala para disfrutar de reproducción ilimitada sin restricciones.
            </span>
          </div>
          <Link
            href="/suscripcion"
            className="shrink-0 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
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
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.nombre || 'Categoría'
              : 'Todas las Sesiones'}
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tema o síntoma..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
        <div className="py-20 text-center text-slate-400 text-sm">
          Cargando biblioteca de hipnosis...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <Sparkles className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
          <p className="font-semibold text-white">No se encontraron sesiones con ese criterio</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
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
