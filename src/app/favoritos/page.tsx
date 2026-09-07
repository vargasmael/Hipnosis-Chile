'use client';

import React, { useEffect, useState } from 'react';
import { getFavoritos } from '@/lib/services/contentService';
import { Sesion } from '@/types/database';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Heart, Compass } from 'lucide-react';
import Link from 'next/link';

export default function FavoritosPage() {
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoritos = async () => {
    setLoading(true);
    const favs = await getFavoritos();
    setSessions(favs);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavoritos();

    // Escuchar eventos reactivos al marcar/desmarcar favoritos
    const handleUpdate = () => {
      fetchFavoritos();
    };

    window.addEventListener('reprograma_favoritos_updated', handleUpdate);
    return () => {
      window.removeEventListener('reprograma_favoritos_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen pb-36 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 font-sans-persona">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#a55850]/20 text-[#a55850] flex items-center justify-center border border-[#a55850]/30 shadow-inner">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Mis Sesiones Favoritas
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] font-light">
            Tu colección personalizada de inducciones y audios para escuchar sin interrupciones.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-[#1e1716] border border-[#2d2220] animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center text-[#a89b97] bg-[#1e1716] rounded-3xl border border-[#2d2220] p-8 space-y-4">
          <Heart className="w-12 h-12 mx-auto text-[#3b2c29]" />
          <h3 className="font-serif-persona text-xl text-[#fbf7f4]">Aún no has guardado favoritos</h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light leading-relaxed">
            Explora las sesiones y pulsa el corazón en cualquiera de ellas para tener acceso instantáneo cada noche.
          </p>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-lg shadow-[#a55850]/20 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4" />
            Explorar Sesiones
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#7d6f6b]">
            Tienes <span className="text-[#fbf7f4] font-medium">{sessions.length}</span> sesiones guardadas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isInitiallyFavorited={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
