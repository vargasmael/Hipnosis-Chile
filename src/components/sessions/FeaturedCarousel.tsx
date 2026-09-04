'use client';

import React, { useState } from 'react';
import { Sesion } from '@/types/database';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Pause, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedCarouselProps {
  sessions: Sesion[];
}

export function FeaturedCarousel({ sessions }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentSession, isPlaying, playSession, togglePlay } = usePlayer();

  if (!sessions || sessions.length === 0) return null;

  const activeSession = sessions[currentIndex];
  const isCurrent = currentSession?.id === activeSession.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const durationMinutes = Math.round(activeSession.duracion / 60);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSession(activeSession);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? sessions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sessions.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Fondo con imagen y degradado oscuro cinemático */}
      <div className="absolute inset-0 z-0">
        {activeSession.url_imagen_portada && (
          <img
            src={activeSession.url_imagen_portada}
            alt={activeSession.titulo}
            className="w-full h-full object-cover object-center filter brightness-[0.4] transition-all duration-700 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      {/* Contenido Hero */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl flex flex-col justify-end min-h-[340px] sm:min-h-[400px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3 h-3" />
            Destacado del Día
          </span>
          <span className="text-xs text-indigo-300 font-medium bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-500/20">
            {activeSession.categoria?.nombre || 'Bienestar'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {activeSession.titulo}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 mt-2 line-clamp-3 leading-relaxed">
          {activeSession.descripcion}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <button
            onClick={handlePlayClick}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            {isCurrentPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pausar Sesión
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" /> Escuchar Ahora ({durationMinutes} min)
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{durationMinutes} minutos de duración</span>
            <span>•</span>
            <span>{activeSession.guia_o_autor}</span>
          </div>
        </div>
      </div>

      {/* Flechas de navegación del carrusel si hay más de una sesión */}
      {sessions.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-md"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-md"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
