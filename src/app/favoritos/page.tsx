'use client';

import React, { useEffect, useState } from 'react';
import { getSesiones } from '@/lib/services/contentService';
import { Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FavoritosPage() {
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getSesiones();
      // Mostrar sesiones marcadas o primeras dos como muestra
      setSessions(all.slice(0, 2));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mis Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tus inducciones y sesiones preferidas guardadas para acceso inmediato.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Cargando favoritos...</div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
          <Heart className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-semibold text-white">Aún no tienes favoritos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explora las sesiones y haz clic en el corazón para guardarlas aquí y escucharlas cada noche.
          </p>
          <Link
            href="/biblioteca"
            className="inline-block px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Explorar biblioteca
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} isInitiallyFavorited={true} />
          ))}
        </div>
      )}
    </div>
  );
}
