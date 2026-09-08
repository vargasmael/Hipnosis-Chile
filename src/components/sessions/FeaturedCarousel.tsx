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
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#1e1716] border border-[#3b2c29] shadow-2xl">
      {/* Fondo con imagen y degradado oscuro cinemático */}
      <div className="absolute inset-0 z-0">
        {(activeSession.imagen_url || activeSession.url_imagen_portada) && (
          <img
            src={activeSession.imagen_url || activeSession.url_imagen_portada || ''}
            alt={activeSession.titulo}
            className="w-full h-full object-cover object-center filter brightness-[0.38] transition-all duration-700 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140f0e] via-[#140f0e]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#140f0e] via-[#140f0e]/85 to-transparent" />
      </div>

      {/* Contenido Hero */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-2xl flex flex-col justify-end min-h-[340px] sm:min-h-[380px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#a55850] text-white text-[11px] font-semibold tracking-wider uppercase shadow-md shadow-[#a55850]/30 font-sans-persona">
            <Sparkles className="w-3 h-3" />
            Sesión Destacada
          </span>
          <span className="text-xs text-[#d8aba1] font-medium bg-[#140f0e]/80 px-2.5 py-1 rounded-full border border-[#3b2c29]">
            {activeSession.categoria?.nombre || 'Bienestar'}
          </span>
        </div>

        <h2 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight leading-tight">
          {activeSession.titulo}
        </h2>

        <p className="text-xs sm:text-sm text-[#c7b9b4] mt-2.5 line-clamp-2 sm:line-clamp-3 leading-relaxed font-light">
          {activeSession.descripcion}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <button
            onClick={handlePlayClick}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-xs tracking-wide shadow-xl shadow-[#a55850]/30 transition-all hover:scale-105 active:scale-95"
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

          <div className="flex items-center gap-2 text-xs text-[#a89b97]">
            <Clock className="w-4 h-4 text-[#b98d76]" />
            <span>{durationMinutes} min de reprogramación</span>
            <span>•</span>
            <span className="text-[#d8aba1]">{activeSession.guia_o_autor}</span>
          </div>
        </div>
      </div>

      {/* Flechas de navegación del carrusel si hay más de una sesión */}
      {sessions.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-[#140f0e]/80 hover:bg-[#251d1c] text-[#ece5e2] hover:text-white border border-[#3b2c29] transition-colors shadow-md"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#a89b97] px-1 font-mono">
            {currentIndex + 1} / {sessions.length}
          </span>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-[#140f0e]/80 hover:bg-[#251d1c] text-[#ece5e2] hover:text-white border border-[#3b2c29] transition-colors shadow-md"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
