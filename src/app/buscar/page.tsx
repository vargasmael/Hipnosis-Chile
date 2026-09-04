'use client';

import React, { useEffect, useState } from 'react';
import { getCategorias, getSesiones } from '@/lib/services/contentService';
import { Categoria, Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Search, Filter, Clock, Sparkles } from 'lucide-react';

export default function BuscarPage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [cats, sess] = await Promise.all([getCategorias(), getSesiones()]);
      setCategories(cats);
      setSessions(sess);
      setLoading(false);
    }
    init();
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.titulo.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      s.guia_o_autor.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat ? s.id_categoria === selectedCat : true;

    let matchesDuration = true;
    const minutes = s.duracion / 60;
    if (selectedDuration === 'short') {
      matchesDuration = minutes <= 10;
    } else if (selectedDuration === 'medium') {
      matchesDuration = minutes > 10 && minutes <= 20;
    } else if (selectedDuration === 'long') {
      matchesDuration = minutes > 20;
    }

    return matchesSearch && matchesCat && matchesDuration;
  });

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Explorar & Buscar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Encuentra la sesión perfecta según tu estado de ánimo, síntoma o tiempo disponible.
        </p>
      </div>

      {/* Buscador Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca por título, síntoma (ej. insomnio, estrés) o terapeuta..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-lg"
        />
      </div>

      {/* Filtros de Duración */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" /> Filtrar por duración:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Cualquier duración' },
            { id: 'short', label: 'Corta (menos de 10 min)' },
            { id: 'medium', label: 'Media (10 a 20 min)' },
            { id: 'long', label: 'Profunda (más de 20 min)' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDuration(item.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedDuration === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorías Cards */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 block">
          Categorías temáticas:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedCat(null)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedCat === null
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-xs font-semibold block">Todas</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedCat === cat.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-semibold block truncate">{cat.nombre}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                {cat.descripcion || 'Sesiones guiadas'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Resultados ({filtered.length})
          </h2>
          {(search || selectedCat || selectedDuration !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCat(null);
                setSelectedDuration('all');
              }}
              className="text-xs text-indigo-400 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Buscando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
            <p className="font-semibold text-white">No encontramos sesiones con esos filtros</p>
            <p className="text-xs text-slate-400 mt-1">Intenta con una duración más amplia o palabras clave generales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
