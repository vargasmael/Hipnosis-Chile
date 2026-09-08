'use client';

import React from 'react';
import { Play, Sparkles, ShieldCheck } from 'lucide-react';

export const DEFAULT_WELCOME_YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/**
 * Convierte URLs estándar de YouTube, youtu.be, shorts o embeds a formato /embed/{id}
 */
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  try {
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/')[1]?.split('?')[0];
      if (parts) return 'https://www.youtube.com/embed/' + parts + '?rel=0&modestbranding=1';
    }

    if (url.includes('watch?v=')) {
      const parts = url.split('watch?v=')[1]?.split('&')[0];
      if (parts) return 'https://www.youtube.com/embed/' + parts + '?rel=0&modestbranding=1';
    }

    if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (parts) return 'https://www.youtube.com/embed/' + parts + '?rel=0&modestbranding=1';
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return 'https://www.youtube.com/embed/' + url.trim() + '?rel=0&modestbranding=1';
    }

    return url;
  } catch {
    return url;
  }
}

interface VSLPlayerProps {
  videoUrl?: string;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function VSLPlayer({
  videoUrl,
  badgeText = 'Mensaje del Especialista',
  title = 'Conoce el Método Re-Programa antes de comenzar',
  subtitle = 'Descubre en 2 minutos cómo la hipnosis clínica y la reprogramación mental transformarán tu descanso y tu paz interior.',
  className = '',
}: VSLPlayerProps) {
  const rawUrl =
    videoUrl ||
    process.env.NEXT_PUBLIC_WELCOME_YOUTUBE_URL ||
    DEFAULT_WELCOME_YOUTUBE_URL;

  const embedUrl = getYouTubeEmbedUrl(rawUrl);

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-4 ${className}`}>
      {/* Encabezado editorial persuasivo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e1716] border border-[#a55850]/40 text-[#b98d76] text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#a55850]" />
          <span>{badgeText}</span>
        </div>
        {title && (
          <h2 className="font-serif-persona text-xl sm:text-2xl font-normal text-[#fbf7f4] tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#a89b97] font-light max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Contenedor del Video con diseño de alta conversión */}
      <div className="relative rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-[#a55850]/40 via-[#2d2220] to-[#1e1716] border border-[#a55850]/40 shadow-2xl shadow-black/60 group">
        <div className="absolute -inset-1 bg-[#a55850]/20 rounded-3xl blur-xl pointer-events-none -z-10 group-hover:bg-[#a55850]/30 transition-all duration-500" />

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
          <iframe
            src={embedUrl}
            title="Video de Presentación Re-Programa"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="pt-2.5 pb-1 px-3 flex items-center justify-between text-[11px] text-[#a89b97]">
          <div className="flex items-center gap-1.5 text-[#d8aba1]">
            <Play className="w-3 h-3 text-[#a55850] fill-[#a55850]" />
            <span>Explicación guiada en video</span>
          </div>
          <div className="flex items-center gap-1 text-[#b98d76]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Método Clínico Comprobado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
