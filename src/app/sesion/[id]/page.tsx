'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { normalizeFirestoreSesion } from '@/lib/services/contentService';
import { Sesion } from '@/types/database';
import { usePlayer } from '@/context/PlayerContext';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ArrowLeft,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Feather,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SesionPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const { closePlayer } = usePlayer();

  // Estados de datos
  const [session, setSession] = useState<Sesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados del Reproductor
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioBuffering, setIsAudioBuffering] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // Detener el reproductor flotante global al entrar a la página individual
  useEffect(() => {
    closePlayer();
  }, [closePlayer]);

  // 1. Fetching de Firestore: Obtener la sesión por su ID con try/catch
  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      if (!sessionId) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const docRef = doc(db, 'sesiones', sessionId);
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (docSnap.exists()) {
          const loaded = normalizeFirestoreSesion(docSnap.id, docSnap.data());
          setSession(loaded);
          setDuration(loaded.duracion || 0);
        } else {
          setErrorMsg('La sesión solicitada no existe o ha sido archivada.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error al obtener sesión de Firestore:', err);
        setErrorMsg('Error al conectar con Firestore para cargar la sesión.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSession();

    // Cargar estado de favorito local
    if (typeof window !== 'undefined' && sessionId) {
      try {
        const favs = JSON.parse(localStorage.getItem('reprograma_favoritos_ids') || '[]');
        setIsFavorited(favs.includes(sessionId));
      } catch {
        setIsFavorited(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const audioSrc =
    session?.audio_url ||
    session?.url_archivo_multimedia ||
    '';

  // Forzar carga de audio cuando cambie audioSrc
  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.load();
    }
  }, [audioSrc]);

  // Media Session API para background playback y pantalla de bloqueo
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !session) {
      return;
    }

    const artworkUrl =
      session.imagen_url ||
      session.url_imagen_portada ||
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: session.titulo,
      artist: session.guia_o_autor || 'Re-Programa',
      album: session.categoria?.nombre || 'Terapia & Reprogramación',
      artwork: [
        { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    const syncPositionState = () => {
      if ('setPositionState' in navigator.mediaSession && audioRef.current) {
        const audioDur = audioRef.current.duration;
        if (!isNaN(audioDur) && audioDur > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audioDur,
              playbackRate: audioRef.current.playbackRate || 1,
              position: Math.min(audioRef.current.currentTime || 0, audioDur),
            });
          } catch {}
        }
      }
    };

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      });
    } catch {}

    try {
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      });
    } catch {}

    try {
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 15;
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - offset);
          syncPositionState();
        }
      });
    } catch {}

    try {
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 15;
        if (audioRef.current) {
          const maxDur = audioRef.current.duration || duration || Infinity;
          audioRef.current.currentTime = Math.min(maxDur, audioRef.current.currentTime + offset);
          syncPositionState();
        }
      });
    } catch {}

    return () => {
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
          navigator.mediaSession.setActionHandler('seekbackward', null);
          navigator.mediaSession.setActionHandler('seekforward', null);
        } catch {}
      }
    };
  }, [session, duration]);

  // Reflejar estado en MediaSession
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Controles Nativos JS vinculados a la referencia de Audio
  const togglePlay = async () => {
    if (!audioRef.current) return;
    setAudioError(null);

    if (audioRef.current.paused) {
      try {
        setIsAudioBuffering(true);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.warn('Fallo en reproducción inicial, reintentando con load():', err);
        try {
          if (audioRef.current) {
            audioRef.current.load();
            await audioRef.current.play();
            setIsPlaying(true);
            setAudioError(null);
          }
        } catch (retryErr: any) {
          console.error('Error definitivo al reproducir audio:', retryErr);
          setIsPlaying(false);
          setAudioError(
            retryErr?.name === 'NotAllowedError'
              ? 'El navegador pausó la reproducción automática. Haz clic de nuevo para autorizar el audio.'
              : 'Error al iniciar la reproducción. Por favor presiona "Reintentar".'
          );
        }
      } finally {
        setIsAudioBuffering(false);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipBackward15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    setCurrentTime(audioRef.current.currentTime);
  };

  const skipForward15 = () => {
    if (!audioRef.current) return;
    const maxDur = audioRef.current.duration || duration || Infinity;
    audioRef.current.currentTime = Math.min(maxDur, audioRef.current.currentTime + 15);
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 0.8];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const toggleFavorite = () => {
    const nextFav = !isFavorited;
    setIsFavorited(nextFav);
    if (typeof window !== 'undefined' && sessionId) {
      try {
        const favs: string[] = JSON.parse(localStorage.getItem('reprograma_favoritos_ids') || '[]');
        const updated = nextFav
          ? Array.from(new Set([...favs, sessionId]))
          : favs.filter((id) => id !== sessionId);
        localStorage.setItem('reprograma_favoritos_ids', JSON.stringify(updated));
      } catch {}
    }
  };

  // Estado de Carga
  if (loading) {
    return (
      <div className="min-h-screen bg-[#140f0e] text-[#ece5e2] flex flex-col items-center justify-center p-6 space-y-6 font-sans-persona">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-[#1e1716] border border-[#2d2220] animate-pulse flex items-center justify-center shadow-2xl">
          <Sparkles className="w-12 h-12 text-[#a55850] opacity-60 animate-spin" />
        </div>
        <div className="space-y-2 text-center max-w-sm">
          <div className="h-6 w-48 bg-[#1e1716] rounded-full mx-auto animate-pulse" />
          <p className="text-xs text-[#a89b97]">Sintonizando frecuencia de calma...</p>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (errorMsg || !session) {
    return (
      <div className="min-h-screen bg-[#140f0e] text-[#ece5e2] flex flex-col items-center justify-center p-6 space-y-6 font-sans-persona text-center">
        <div className="p-6 rounded-3xl bg-[#1e1716] border border-[#3b2c29] max-w-md space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-[#a55850] mx-auto" />
          <h2 className="font-serif-persona text-2xl text-[#fbf7f4]">Sesión No Encontrada</h2>
          <p className="text-xs sm:text-sm text-[#a89b97] leading-relaxed">
            {errorMsg || 'La sesión seleccionada no se encuentra disponible.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Santuario
          </Link>
        </div>
      </div>
    );
  }

  const coverImage =
    session.imagen_url ||
    session.url_imagen_portada ||
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#181211] via-[#140f0e] to-[#0d0a09] text-[#fbf7f4] flex flex-col justify-between py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full font-sans-persona selection:bg-[#a55850]/40">
      {/* Elemento de Audio HTML5 (usa sr-only en vez de hidden para evitar throttling de navegadores) */}
      <audio
        key={audioSrc}
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onPlay={() => {
          setIsPlaying(true);
          setIsAudioBuffering(false);
          setAudioError(null);
        }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsAudioBuffering(true)}
        onCanPlay={() => setIsAudioBuffering(false)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsAudioBuffering(false);
          setAudioError(null);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          setIsPlaying(false);
          setIsAudioBuffering(false);
          console.error('Error en elemento de audio HTML5:', e, audioRef.current?.error);
          setAudioError('Error al cargar el archivo de audio. Verifica que tu conexión esté activa.');
        }}
        className="sr-only"
      />

      {/* Barra Superior Minimalista */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1716] hover:bg-[#281e1c] border border-[#2d2220] text-xs text-[#a89b97] hover:text-[#fbf7f4] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1716]/80 border border-[#3b2c29] text-[11px] text-[#b98d76] font-medium">
          <Feather className="w-3.5 h-3.5 text-[#a55850]" />
          <span>Sesión Guiada</span>
        </div>

        <button
          onClick={toggleFavorite}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${
            isFavorited
              ? 'bg-[#a55850]/20 border-[#a55850] text-[#a55850]'
              : 'bg-[#1e1716] border-[#2d2220] text-[#a89b97] hover:text-white'
          }`}
          title={isFavorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      </header>

      {/* Zona Central: Portada Grande e Identidad */}
      <main className="flex-1 flex flex-col items-center justify-center my-4 sm:my-8 space-y-6 sm:space-y-8 w-full max-w-lg mx-auto">
        {/* Portada Grande con Resplandor Terapéutico */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-[#a55850]/20 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-[#3b2c29] bg-[#1c1514]">
            <img
              src={coverImage}
              alt={session.titulo}
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* Overlay sutil de viñeta */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badge de Terapeuta sobre la imagen */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-[11px] text-[#d8aba1]">
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Headphones className="w-3 h-3 text-[#b98d76]" />
                {session.guia_o_autor || 'Terapeuta Marco A. Vargas'}
              </span>
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[#ece5e2]">
                {session.categoria?.nombre || 'Hipnosis Terapéutica'}
              </span>
            </div>
          </div>
        </div>

        {/* Título y Descripción */}
        <div className="text-center space-y-2 px-4">
          <h1 className="font-serif-persona text-2xl sm:text-3xl md:text-4xl font-normal text-[#fbf7f4] tracking-tight line-clamp-2">
            {session.titulo}
          </h1>
          {session.descripcion && (
            <p className="text-xs sm:text-sm text-[#a89b97] font-light max-w-md mx-auto line-clamp-2">
              {session.descripcion}
            </p>
          )}
        </div>

        {/* Alerta de Error de Audio con botón Reintentar si falla */}
        {audioError && (
          <div className="w-full p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{audioError}</span>
            </div>
            <button
              onClick={togglePlay}
              className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-red-800 hover:bg-red-700 text-white font-medium text-[11px] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reintentar
            </button>
          </div>
        )}

        {/* Barra de Progreso y Tiempos */}
        <div className="w-full space-y-2 pt-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-[#2d2220] rounded-lg appearance-none cursor-pointer accent-[#a55850]"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#a89b97] font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles Circulares Minimalistas */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 pt-2">
          {/* Salto -15 Segundos */}
          <button
            onClick={skipBackward15}
            className="w-14 h-14 rounded-full bg-[#1e1716] hover:bg-[#281e1c] border border-[#3b2c29] hover:border-[#a55850] text-[#d8aba1] hover:text-[#fbf7f4] flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg relative group cursor-pointer"
            title="Retroceder 15 segundos"
          >
            <RotateCcw className="w-5 h-5 text-[#b98d76] group-hover:text-[#fbf7f4] transition-colors" />
            <span className="text-[9px] font-bold text-[#b98d76] group-hover:text-[#fbf7f4] mt-0.5">
              15
            </span>
          </button>

          {/* Botón Central de Play / Pause */}
          <button
            onClick={togglePlay}
            disabled={isAudioBuffering}
            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-[#a55850]/40 border-2 border-[#d8aba1]/30 cursor-pointer disabled:opacity-80"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isAudioBuffering ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Salto +15 Segundos */}
          <button
            onClick={skipForward15}
            className="w-14 h-14 rounded-full bg-[#1e1716] hover:bg-[#281e1c] border border-[#3b2c29] hover:border-[#a55850] text-[#d8aba1] hover:text-[#fbf7f4] flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg relative group cursor-pointer"
            title="Avanzar 15 segundos"
          >
            <RotateCw className="w-5 h-5 text-[#b98d76] group-hover:text-[#fbf7f4] transition-colors" />
            <span className="text-[9px] font-bold text-[#b98d76] group-hover:text-[#fbf7f4] mt-0.5">
              15
            </span>
          </button>
        </div>

        {/* Opciones Adicionales: Silenciar y Velocidad */}
        <div className="flex items-center gap-6 pt-2 text-xs text-[#a89b97]">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 hover:text-[#fbf7f4] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Silenciado' : 'Audio'}</span>
          </button>

          <span className="text-[#3b2c29]">•</span>

          <button
            onClick={cyclePlaybackRate}
            className="flex items-center gap-1.5 hover:text-[#fbf7f4] transition-colors cursor-pointer font-mono"
            title="Cambiar velocidad de reproducción"
          >
            <span>{playbackRate}x</span>
          </button>
        </div>
      </main>

      {/* Pie de Página */}
      <footer className="text-center py-2 text-[11px] text-[#7d6f6b]">
        Re-Programa • Frecuencias e Inducciones Guiadas
      </footer>
    </div>
  );
}