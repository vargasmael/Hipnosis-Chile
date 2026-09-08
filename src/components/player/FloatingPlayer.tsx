'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorito } from '@/lib/services/contentService';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  Heart,
  X,
  Video,
  Maximize2
} from 'lucide-react';

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '00:00';
  const mins = Math.floor(secs / 60);
  const rem = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
}

export function FloatingPlayer() {
  const {
    currentSession,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isExpanded,
    togglePlay,
    seekTo,
    skip,
    setVolume,
    setPlaybackRate,
    setIsExpanded,
    closePlayer,
  } = usePlayer();

  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // Cargar estado de favorito inicial cuando cambia la sesión
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSession) {
      try {
        const saved = localStorage.getItem('reprograma_favoritos_ids');
        if (saved) {
          const ids: string[] = JSON.parse(saved);
          setIsFavorited(ids.includes(currentSession.id));
        } else {
          setIsFavorited(false);
        }
      } catch {
        setIsFavorited(false);
      }
    }
  }, [currentSession]);

  if (!currentSession) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isVideo = currentSession.tipo_multimedia === 'video';

  const handleFavoriteToggle = async () => {
    const newState = !isFavorited;
    setIsFavorited(newState);
    await toggleFavorito(user?.id || 'demo_user', currentSession.id, newState);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume || 1);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleNextRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. MINI REPRODUCTOR FLOTANTE INFERIOR                         */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-16 md:bottom-3 left-0 right-0 md:left-4 md:right-4 z-30 max-w-4xl md:mx-auto">
        <div className="bg-[#1a1312]/95 backdrop-blur-2xl border border-[#3b2c29] md:rounded-3xl px-4 py-2.5 shadow-2xl transition-all relative overflow-hidden">
          {/* Barra fina de progreso superior */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-[#2d2220] cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              seekTo(clickPos * duration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#a55850] to-[#b98d76] relative transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Carátula y Título (Tocar expande el modal) */}
            <div
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#2d2220] shrink-0 shadow-md">
                {(currentSession.imagen_url || currentSession.url_imagen_portada) ? (
                  <img
                    src={currentSession.imagen_url || currentSession.url_imagen_portada || ''}
                    alt={currentSession.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#251d1c] text-[#a55850]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pr-2">
                <h4 className="font-serif-persona text-sm font-normal text-[#fbf7f4] truncate hover:text-[#d8aba1] transition-colors">
                  {currentSession.titulo}
                </h4>
                <p className="text-[11px] text-[#a89b97] truncate font-light">
                  {currentSession.guia_o_autor || 'Re-Programa'}
                </p>
              </div>
            </div>

            {/* Controles rápidos */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => skip(-15)}
                className="p-2 text-[#a89b97] hover:text-white transition-colors"
                title="Retroceder 15 segundos"
                aria-label="Retroceder 15 segundos"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white flex items-center justify-center shadow-lg shadow-[#a55850]/30 transition-transform active:scale-95"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => skip(15)}
                className="p-2 text-[#a89b97] hover:text-white transition-colors"
                title="Avanzar 15 segundos"
                aria-label="Avanzar 15 segundos"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="hidden sm:flex p-2 text-[#a89b97] hover:text-white transition-colors"
                title="Maximizar reproductor"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={closePlayer}
                className="p-2 text-[#7d6f6b] hover:text-rose-400 transition-colors"
                title="Cerrar reproductor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MODAL / BOTTOM SHEET EXPANDIDO (TIPO SPOTIFY)              */}
      {/* ------------------------------------------------------------- */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#140f0e]/98 backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 animate-in slide-in-from-bottom duration-300 overflow-y-auto font-sans-persona">
          {/* Barra superior modal */}
          <div className="flex items-center justify-between max-w-lg mx-auto w-full">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-3 rounded-full bg-[#1e1716] text-[#ece5e2] hover:text-white border border-[#3b2c29] transition-colors"
              aria-label="Minimizar reproductor"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[11px] uppercase tracking-widest text-[#b98d76] font-semibold block font-sans-persona">
                Reproduciendo Ahora
              </span>
              <p className="text-xs text-[#a89b97] font-light">
                {currentSession.categoria?.nombre || 'Sesión Guiada'}
              </p>
            </div>

            <button
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-full bg-[#1e1716] border border-[#3b2c29] transition-colors ${
                isFavorited ? 'text-[#a55850]' : 'text-[#a89b97] hover:text-white'
              }`}
              aria-label="Marcar como favorito"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Carátula Grande Central y Detalles */}
          <div className="max-w-md mx-auto w-full my-auto flex flex-col items-center py-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#3b2c29] group">
              {isPlaying && (
                <div className="absolute inset-0 bg-[#a55850]/15 rounded-3xl animate-ping opacity-25 pointer-events-none" />
              )}
              {(currentSession.imagen_url || currentSession.url_imagen_portada) ? (
                <img
                  src={currentSession.imagen_url || currentSession.url_imagen_portada || ''}
                  alt={currentSession.titulo}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-[#1e1716] flex items-center justify-center text-[#a55850]">
                  <Sparkles className="w-16 h-16 animate-pulse" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#140f0e]/80 via-transparent to-transparent" />
            </div>

            <div className="mt-8 text-center max-w-sm">
              <h2 className="font-serif-persona text-2xl sm:text-3xl font-normal text-[#fbf7f4] tracking-tight">
                {currentSession.titulo}
              </h2>
              <p className="text-sm text-[#b98d76] mt-1.5 font-medium">
                {currentSession.guia_o_autor || 'Re-Programa'}
              </p>
              <p className="text-xs text-[#a89b97] mt-2.5 line-clamp-2 font-light leading-relaxed">
                {currentSession.descripcion}
              </p>
            </div>
          </div>

          {/* Controles de Reproducción y Scrubbing */}
          <div className="max-w-md mx-auto w-full pb-4">
            {/* Barra de progreso simulada/interactiva */}
            <div className="space-y-2 mb-8">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-2 accent-[#a55850] bg-[#2d2220] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-[#a89b97]">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Botones de Control Principal */}
            <div className="flex items-center justify-between px-4">
              <button
                onClick={handleNextRate}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-[#1e1716] border border-[#3b2c29] text-[#b98d76] hover:text-white transition-colors"
                title="Velocidad"
              >
                {playbackRate}x
              </button>

              <button
                onClick={() => skip(-15)}
                className="p-3 text-[#ece5e2] hover:text-white transition-transform active:scale-90"
                title="Retroceder 15s"
                aria-label="Retroceder 15 segundos"
              >
                <RotateCcw className="w-7 h-7" />
              </button>

              <button
                onClick={togglePlay}
                className="w-18 h-18 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white flex items-center justify-center shadow-2xl shadow-[#a55850]/40 transition-transform active:scale-95 border border-[#a55850]"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button
                onClick={() => skip(15)}
                className="p-3 text-[#ece5e2] hover:text-white transition-transform active:scale-90"
                title="Avanzar 15s"
                aria-label="Avanzar 15 segundos"
              >
                <RotateCw className="w-7 h-7" />
              </button>

              <button
                onClick={handleMuteToggle}
                className="p-3 text-[#a89b97] hover:text-white transition-colors"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {volume === 0 || isMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#b98d76]" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
