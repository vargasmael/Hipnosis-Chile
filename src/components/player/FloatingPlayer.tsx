'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  Sparkles,
  Heart,
  X,
  Video
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

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!currentSession) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isVideo = currentSession.tipo_multimedia === 'video';

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

  // Helper para procesar URLs de video (Cloudflare Stream, Vimeo, R2 o Google Drive)
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    // Google Drive: convertir view a preview para que funcione el reproductor
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view(\?.*)?$/, '/preview');
    }
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const isEmbedVideo =
    isVideo &&
    (currentSession.url_archivo_multimedia.includes('drive.google.com') ||
      currentSession.url_archivo_multimedia.includes('youtube') ||
      currentSession.url_archivo_multimedia.includes('vimeo') ||
      currentSession.url_archivo_multimedia.includes('iframe'));

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* REPRODUCTOR FLOTANTE DOCK (MINI-PLAYER FIJO INFERIOR)          */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2.5 shadow-2xl transition-all">
        {/* Barra fina de progreso superior interactiva */}
        <div
          className="absolute -top-1 left-0 right-0 h-1.5 bg-slate-800 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seekTo(clickPos * duration);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Carátula y Título */}
          <div
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 shadow-inner">
              {currentSession.url_imagen_portada ? (
                <img
                  src={currentSession.url_imagen_portada}
                  alt={currentSession.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
                  {isVideo ? <Video className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
              )}
              {isVideo && (
                <div className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] text-teal-400 font-bold">
                  VIDEO
                </div>
              )}
            </div>
            <div className="min-w-0 pr-2">
              <h4 className="text-sm font-medium text-white truncate hover:text-indigo-300 transition-colors">
                {currentSession.titulo}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {currentSession.guia_o_autor || 'Hipnosis Chile'}
              </p>
            </div>
          </div>

          {/* Controles Principales */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={() => skip(-15)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Retroceder 15 segundos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => skip(15)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Avanzar 15 segundos"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Tiempo y Opciones (Desktop) */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-xs font-mono text-slate-400">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>

            {/* Velocidad */}
            <button
              onClick={handleNextRate}
              className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Cambiar velocidad de reproducción"
            >
              {playbackRate}x
            </button>

            {/* Volumen */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {volume === 0 || isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setIsMuted(false);
                  setVolume(parseFloat(e.target.value));
                }}
                className="w-16 h-1 accent-indigo-500 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Maximizar */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Cerrar */}
            <button
              onClick={closePlayer}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Cerrar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL EXPANDIDO COMPLETO (AUDIO Y VIDEO EN PANTALLA COMPLETA) */}
      {/* ------------------------------------------------------------- */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto">
          {/* Barra superior modal */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full mb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
                {isVideo ? 'Sesión en Video' : 'Reproduciendo Audio'}
              </span>
              <p className="text-xs text-slate-400">
                {currentSession.categoria?.nombre || 'Hipnosis Chile'}
              </p>
            </div>

            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2.5 rounded-full bg-slate-900/80 border border-slate-800 transition-colors ${
                isFavorited ? 'text-rose-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* REPRODUCTOR CENTRAL: VIDEO O AUDIO */}
          <div className="max-w-3xl mx-auto w-full my-auto flex flex-col items-center">
            {isVideo ? (
              <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-indigo-500/20 relative">
                {isEmbedVideo ? (
                  <iframe
                    src={getVideoEmbedUrl(currentSession.url_archivo_multimedia)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentSession.url_archivo_multimedia}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/20 group">
                {isPlaying && (
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl animate-ping opacity-30 pointer-events-none" />
                )}
                {currentSession.url_imagen_portada ? (
                  <img
                    src={currentSession.url_imagen_portada}
                    alt={currentSession.titulo}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-16 h-16 animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>
            )}

            <div className="mt-6 text-center max-w-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentSession.titulo}
              </h2>
              <p className="text-sm text-indigo-300 mt-1">
                {currentSession.guia_o_autor || 'Hipnosis Chile'}
              </p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {currentSession.descripcion}
              </p>
            </div>
          </div>

          {/* Controles expandidos inferiores (para sesiones de audio o video directo) */}
          {!isEmbedVideo && (
            <div className="max-w-xl mx-auto w-full pb-4 mt-4">
              {/* Slider de tiempo */}
              <div className="space-y-1.5 mb-6">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-2 accent-indigo-500 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>

              {/* Botonera de control central */}
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                <button
                  onClick={handleNextRate}
                  className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  {playbackRate}x
                </button>

                <button
                  onClick={() => skip(-15)}
                  className="p-3 text-slate-300 hover:text-white transition-transform active:scale-90"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>

                <button
                  onClick={() => skip(15)}
                  className="p-3 text-slate-300 hover:text-white transition-transform active:scale-90"
                >
                  <RotateCw className="w-6 h-6" />
                </button>

                <button
                  onClick={handleMuteToggle}
                  className="p-3 text-slate-400 hover:text-white"
                >
                  {volume === 0 || isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
