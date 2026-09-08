'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sesion } from '@/types/database';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorito } from '@/lib/services/contentService';
import { Play, Pause, Heart, Clock, Sparkles } from 'lucide-react';

interface SessionCardProps {
  session: Sesion;
  variant?: 'grid' | 'horizontal';
  progressSeconds?: number;
  isInitiallyFavorited?: boolean;
}

export function SessionCard({
  session,
  variant = 'grid',
  progressSeconds = 0,
  isInitiallyFavorited = false,
}: SessionCardProps) {
  const router = useRouter();
  const { currentSession, isPlaying, playSession, togglePlay } = usePlayer();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);

  const isCurrent = currentSession?.id === session.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const durationMinutes = Math.round(session.duracion / 60);

  const handleCardClick = () => {
    router.push(`/sesion/${session.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/sesion/${session.id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorited;
    setIsFavorited(newState);
    if (user) {
      await toggleFavorito(user.id, session.id, newState);
    }
  };

  if (variant === 'horizontal') {
    return (
      <div
        onClick={handlePlayClick}
        className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer shadow-sm"
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
          {(session.imagen_url || session.url_imagen_portada) ? (
            <img
              src={session.imagen_url || session.url_imagen_portada || ''}
              alt={session.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
              {isCurrentPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full">
              {session.categoria?.nombre || 'Bienestar'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {durationMinutes} min
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {session.titulo}
          </h4>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {session.guia_o_autor}
          </p>

          {/* Barra de progreso si hay progreso previo */}
          {progressSeconds > 0 && session.duracion > 0 && (
            <div className="mt-2 w-full max-w-[200px] h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, (progressSeconds / session.duracion) * 100)}%` }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full hover:bg-slate-700/60 transition-colors ${
            isFavorited ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handlePlayClick}
      className="group relative flex flex-col rounded-3xl bg-[#1e1716] hover:bg-[#251d1c] border border-[#3b2c29] hover:border-[#a55850]/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#a55850]/10 cursor-pointer"
    >
      {/* Portada */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#2d2220]">
        {(session.imagen_url || session.url_imagen_portada) ? (
          <img
            src={session.imagen_url || session.url_imagen_portada || ''}
            alt={session.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#251d1c] text-[#a55850]">
            <Sparkles className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140f0e] via-[#140f0e]/20 to-transparent" />

        {/* Badge duración */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#140f0e]/80 backdrop-blur-md text-[#ece5e2] text-xs font-medium border border-[#3b2c29]">
          <Clock className="w-3.5 h-3.5 text-[#b98d76]" />
          <span>{durationMinutes} min</span>
        </div>

        {/* Botón Favorito en portada */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full bg-[#140f0e]/70 backdrop-blur-md border border-[#3b2c29] transition-colors ${
            isFavorited ? 'text-[#a55850]' : 'text-[#a89b97] hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Botón Play central en Hover o activo */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all ${
            isCurrentPlaying
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 bg-black/30'
          }`}
        >
          <div className="w-13 h-13 rounded-2xl bg-[#a55850] hover:bg-[#b8665d] text-white flex items-center justify-center shadow-lg shadow-[#a55850]/40 transition-transform active:scale-95 group-hover:scale-110">
            {isCurrentPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[#b98d76] uppercase tracking-wider font-sans-persona">
              {session.categoria?.nombre || 'Bienestar'}
            </span>
          </div>
          <h3 className="font-serif-persona text-lg font-normal text-[#fbf7f4] group-hover:text-[#d8aba1] transition-colors line-clamp-1">
            {session.titulo}
          </h3>
          <p className="text-xs text-[#9c8e8a] mt-1.5 line-clamp-2 font-light leading-relaxed">
            {session.descripcion}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#2d2220] flex items-center justify-between text-xs text-[#7d6f6b]">
          <span className="truncate">{session.guia_o_autor}</span>
          <span className="capitalize text-[#b98d76]">{session.tipo_multimedia}</span>
        </div>
      </div>
    </div>
  );
}
