'use client';

import React from 'react';
import { Sesion } from '@/types/database';
import { usePlayer } from '@/context/PlayerContext';
import { History, Play, Pause, Clock } from 'lucide-react';

interface ContinueListeningItem {
  session: Sesion;
  progressSeconds: number;
}

interface ContinueListeningRowProps {
  items: ContinueListeningItem[];
}

export function ContinueListeningRow({ items }: ContinueListeningRowProps) {
  const { currentSession, isPlaying, playSession, togglePlay } = usePlayer();

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#b98d76]" />
          <h3 className="font-serif-persona text-xl font-normal text-[#fbf7f4]">
            Continuar Escuchando
          </h3>
        </div>
        <span className="text-xs text-[#a89b97]">Retoma tu relajación</span>
      </div>

      {/* Fila con scroll horizontal estilizado */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map(({ session, progressSeconds }) => {
          const isCurrent = currentSession?.id === session.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const durationMinutes = Math.round(session.duracion / 60);
          const percent = session.duracion > 0
            ? Math.min(100, Math.round((progressSeconds / session.duracion) * 100))
            : 0;

          const handlePlay = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isCurrent) {
              togglePlay();
            } else {
              playSession(session, progressSeconds);
            }
          };

          return (
            <div
              key={session.id}
              onClick={handlePlay}
              className="group flex-shrink-0 w-72 sm:w-80 snap-start p-3.5 rounded-2xl bg-[#1e1716] hover:bg-[#251d1c] border border-[#3b2c29] hover:border-[#a55850]/50 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20"
            >
              <div className="flex items-center gap-3.5">
                {/* Portada Mini */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#2d2220] flex-shrink-0">
                  {session.url_imagen_portada ? (
                    <img
                      src={session.url_imagen_portada}
                      alt={session.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#140f0e] flex items-center justify-center text-[#a55850]">
                      <Clock className="w-6 h-6" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-[#a55850] text-white flex items-center justify-center shadow">
                      {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-[#b98d76] uppercase tracking-wider block truncate">
                    {session.categoria?.nombre || 'Bienestar'}
                  </span>
                  <h4 className="font-serif-persona text-sm text-[#fbf7f4] group-hover:text-[#d8aba1] truncate transition-colors">
                    {session.titulo}
                  </h4>
                  <p className="text-[11px] text-[#9c8e8a] truncate mt-0.5">
                    {session.guia_o_autor}
                  </p>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="mt-3.5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#7d6f6b]">
                  <span>Progreso</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#140f0e] rounded-full overflow-hidden border border-[#2d2220]">
                  <div
                    className="h-full bg-gradient-to-r from-[#a55850] to-[#b98d76] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
