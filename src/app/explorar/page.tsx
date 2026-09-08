'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getCategorias, getSesiones } from '@/lib/services/contentService';
import { Categoria, Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Search, Sparkles, Filter, Compass, SlidersHorizontal } from 'lucide-react';

export default function ExplorarPage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [cats, sess] = await Promise.all([getCategorias(), getSesiones()]);
        setCategories(cats);
        setSessions(sess);
      } catch (err) {
        console.warn('Error cargando sesiones en Explorar:', err);
        setCategories([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchCat = selectedCategory ? s.id_categoria === selectedCategory : true;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = query
        ? s.titulo.toLowerCase().includes(query) ||
          s.descripcion.toLowerCase().includes(query) ||
          s.guia_o_autor.toLowerCase().includes(query) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)))
        : true;
      return matchCat && matchSearch;
    });
  }, [sessions, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 font-sans-persona">
      {/* Header de Exploración */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[11px] font-semibold text-[#b98d76]">
          <Compass className="w-3.5 h-3.5 text-[#a55850]" />
          <span>Explorador Terapéutico</span>
        </div>
        <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
          Encuentra la inducción que necesitas hoy
        </h1>
        <p className="text-xs sm:text-sm text-[#a89b97] max-w-2xl font-light">
          Filtra por objetivo mental o busca síntomas específicos como insomnio, ataques de pánico o bloqueo creativo.
        </p>
      </div>

      {/* Barra de Búsqueda Interactiva y Píldoras */}
      <div className="space-y-4">
        {/* Input Buscador */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89b97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por emoción, síntoma o terapeuta (ej. insomnio, paz, ansiedad)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1e1716] border border-[#3b2c29] text-[#ece5e2] placeholder-[#7d6f6b] text-sm focus:outline-none focus:border-[#a55850] transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#a89b97] hover:text-[#ece5e2] bg-[#140f0e] px-2 py-0.5 rounded-full"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Botones de Píldoras de Categoría */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
              selectedCategory === null
                ? 'bg-[#a55850] text-white shadow-lg shadow-[#a55850]/25'
                : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#3b2c29]'
            }`}
          >
            Todas las Frecuencias
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#a55850] text-white shadow-lg shadow-[#a55850]/25'
                    : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#3b2c29]'
                }`}
              >
                {cat.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs text-[#a89b97] pt-2 border-t border-[#2d2220]">
        <span>
          Mostrando <strong className="text-[#fbf7f4]">{filteredSessions.length}</strong> sesiones
          {selectedCategory && (
            <span> en {categories.find((c) => c.id === selectedCategory)?.nombre}</span>
          )}
        </span>
      </div>

      {/* Grilla de Resultados */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-[#1e1716] border border-[#2d2220] animate-pulse" />
          ))}
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
          <Sparkles className="w-12 h-12 mx-auto text-[#b98d76] opacity-60" />
          <h3 className="font-serif-persona text-xl sm:text-2xl text-[#fbf7f4]">
            Aún no hay sesiones publicadas. Vuelve pronto.
          </h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-md mx-auto font-light leading-relaxed">
            Estamos preparando nuevas frecuencias binaurales e inducciones terapéuticas para ti. Muy pronto estarán disponibles en este catálogo.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-[#b98d76] opacity-60" />
          <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
            No encontramos sesiones con ese criterio
          </h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light">
            Intenta borrar los términos de búsqueda o cambiar de categoría para ver otras inducciones guiadas.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="px-5 py-2.5 rounded-full bg-[#a55850] text-white text-xs font-medium shadow"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
