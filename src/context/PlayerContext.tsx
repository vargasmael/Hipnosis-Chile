'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Sesion } from '@/types/database';
import { saveProgreso } from '@/lib/services/contentService';
import { useAuth } from './AuthContext';

interface PlayerContextType {
  currentSession: Sesion | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isExpanded: boolean;
  playSession: (session: Sesion, startTime?: number) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  skip: (seconds: number) => void;
  setVolume: (vol: number) => void;
  setPlaybackRate: (rate: number) => void;
  setIsExpanded: (expanded: boolean) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<Sesion | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const userRef = useRef(user);
  userRef.current = user;

  const currentSessionRef = useRef<Sesion | null>(currentSession);
  currentSessionRef.current = currentSession;

  const pendingSeekRef = useRef<number>(0);

  // Inicializar elemento de audio HTML5 una sola vez en el montaje
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Guardar progreso cada 5 segundos si ha avanzado
      if (Math.abs(cur - lastSavedTimeRef.current) >= 5) {
        lastSavedTimeRef.current = cur;
        const u = userRef.current;
        const s = currentSessionRef.current;
        if (u && s) {
          saveProgreso(u.id, s.id, cur, cur >= ((audio.duration || s.duracion || 0) - 10));
        }
      }
    };

    const onLoadedMetadata = () => {
      const s = currentSessionRef.current;
      const dur = audio.duration || s?.duracion || 0;
      setDuration(dur);

      // Aplicar salto de inicio pendiente si existe
      if (pendingSeekRef.current > 0) {
        const target = Math.min(pendingSeekRef.current, dur > 0 ? dur : pendingSeekRef.current);
        try {
          audio.currentTime = target;
          setCurrentTime(target);
        } catch (e) {
          console.warn('Error al ajustar tiempo inicial en loadedmetadata:', e);
        }
        pendingSeekRef.current = 0;
      }
    };

    const onCanPlay = () => {
      if (pendingSeekRef.current > 0) {
        const dur = audio.duration || currentSessionRef.current?.duracion || 0;
        const target = Math.min(pendingSeekRef.current, dur > 0 ? dur : pendingSeekRef.current);
        try {
          audio.currentTime = target;
          setCurrentTime(target);
        } catch (e) {
          console.warn('Error al ajustar tiempo inicial en canplay:', e);
        }
        pendingSeekRef.current = 0;
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      const u = userRef.current;
      const s = currentSessionRef.current;
      if (u && s) {
        saveProgreso(u.id, s.id, audio.duration || s.duracion, true);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      const u = userRef.current;
      const s = currentSessionRef.current;
      if (u && s) {
        saveProgreso(u.id, s.id, audio.currentTime);
      }
    };

    const onError = (e: Event) => {
      console.warn('Error en elemento de audio del reproductor global:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []); // Sin dependencias: sólo una instancia de audio para toda la aplicación

  // Soporte de Media Session API para pantalla de bloqueo y controles del sistema
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentSession) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSession.titulo,
        artist: currentSession.guia_o_autor || 'Re-Programa',
        album: currentSession.categoria?.nombre || 'Sesiones de Bienestar',
        artwork: currentSession.url_imagen_portada || currentSession.imagen_url
          ? [
              { src: currentSession.url_imagen_portada || currentSession.imagen_url || '', sizes: '512x512', type: 'image/jpeg' },
              { src: currentSession.url_imagen_portada || currentSession.imagen_url || '', sizes: '256x256', type: 'image/jpeg' },
            ]
          : undefined,
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play().catch(console.error);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      });
      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + 15);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    } catch (e) {
      console.warn('Error configurando MediaSession:', e);
    }
  }, [currentSession]);

  const playSession = useCallback((session: Sesion, startTime: number = 0) => {
    if (!audioRef.current) return;

    const audioSource = session.audio_url || session.url_archivo_multimedia || '';
    if (!audioSource) {
      console.warn('Sesión sin audioSource:', session);
      return;
    }

    const isSameSession =
      currentSessionRef.current?.id === session.id &&
      audioRef.current.src === audioSource;

    setCurrentSession(session);
    currentSessionRef.current = session;

    if (!isSameSession) {
      pendingSeekRef.current = startTime > 0 ? startTime : 0;
      audioRef.current.src = audioSource;
      audioRef.current.load();
    } else if (startTime > 0) {
      if (audioRef.current.readyState >= 1) {
        audioRef.current.currentTime = startTime;
        setCurrentTime(startTime);
      } else {
        pendingSeekRef.current = startTime;
      }
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Fallo inicial en playSession, reintentando al cargar buffer:', err);
          const onCanPlayOnce = () => {
            audioRef.current?.removeEventListener('canplay', onCanPlayOnce);
            audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
          };
          audioRef.current?.addEventListener('canplay', onCanPlayOnce);
        });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Reproducción bloqueada por navegador:', err);
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
      });
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration || duration || 0;
    const clamped = Math.max(0, Math.min(dur || 9999, time));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [duration]);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRateState(rate);
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentSession(null);
    currentSessionRef.current = null;
    setIsExpanded(false);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSession,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        isExpanded,
        playSession,
        togglePlay,
        seekTo,
        skip,
        setVolume,
        setPlaybackRate,
        setIsExpanded,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer debe usarse dentro de un PlayerProvider');
  }
  return context;
}
