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

  // Inicializar elemento de audio HTML5
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Guardar progreso cada 5 segundos si ha avanzado
      if (Math.abs(cur - lastSavedTimeRef.current) >= 5) {
        lastSavedTimeRef.current = cur;
        if (user && currentSession) {
          saveProgreso(user.id, currentSession.id, cur, cur >= (audio.duration - 10));
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentSession?.duracion || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (user && currentSession) {
        saveProgreso(user.id, currentSession.id, audio.duration, true);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      if (user && currentSession) {
        saveProgreso(user.id, currentSession.id, audio.currentTime);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, [user, currentSession]);

  // Soporte de Media Session API para pantalla de bloqueo y controles del sistema (Bluetooth/móvil)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentSession) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSession.titulo,
        artist: currentSession.guia_o_autor || 'Hipnosis Chile',
        album: currentSession.categoria?.nombre || 'Sesiones de Bienestar',
        artwork: currentSession.url_imagen_portada
          ? [
              { src: currentSession.url_imagen_portada, sizes: '512x512', type: 'image/jpeg' },
              { src: currentSession.url_imagen_portada, sizes: '256x256', type: 'image/jpeg' },
            ]
          : undefined,
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
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

    const isSameSession = currentSession?.id === session.id;

    if (!isSameSession) {
      setCurrentSession(session);
      audioRef.current.src = session.url_archivo_multimedia;
      audioRef.current.load();
      if (startTime > 0) {
        audioRef.current.currentTime = startTime;
        setCurrentTime(startTime);
      }
    } else if (startTime > 0 && Math.abs(audioRef.current.currentTime - startTime) > 2) {
      audioRef.current.currentTime = startTime;
    }

    audioRef.current.play().catch((err) => {
      console.warn('Autoplay bloqueado por el navegador:', err);
    });
    setIsPlaying(true);
  }, [currentSession]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Reproducción bloqueada:', err);
      });
    }
  }, [isPlaying]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

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
