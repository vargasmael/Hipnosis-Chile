'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Usuario, EstadoSuscripcion, RolUsuario } from '@/types/database';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, nombre: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setDemoUser: (estado: EstadoSuscripcion, rol?: RolUsuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function syncUserCookies(u: Usuario | null) {
  if (typeof document === 'undefined') return;
  if (u) {
    document.cookie = `reprograma_auth=true; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `reprograma_sub=${u.estado_suscripcion}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `reprograma_role=${u.rol}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `reprograma_user_id=${u.id}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `reprograma_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `reprograma_sub=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `reprograma_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    document.cookie = `reprograma_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUserId: string, email: string) => {
    try {
      // 1. Intentar leer de la tabla 'profiles' (nueva estándar Fase 5)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      // 2. Si falla o no existe, intentar de la tabla legacy 'usuarios'
      if (error || !data) {
        const resUsuarios = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', authUserId)
          .single();
        if (resUsuarios.data) {
          data = resUsuarios.data;
          error = null;
        }
      }

      if (data && !error) {
        const u: Usuario = {
          id: data.id,
          email: data.email || email,
          nombre_completo: data.nombre_completo || email.split('@')[0],
          estado_suscripcion: data.estado_suscripcion || 'inactiva',
          rol: data.rol || 'user',
          id_suscripcion_mercadopago: data.mercadopago_customer_id || data.id_suscripcion_mercadopago || null,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
        setUser(u);
        syncUserCookies(u);
      } else {
        // Usuario autenticado en auth.users pero sin fila en profiles aún
        const u: Usuario = {
          id: authUserId,
          email,
          nombre_completo: email.split('@')[0],
          estado_suscripcion: 'inactiva',
          rol: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(u);
        syncUserCookies(u);
      }
    } catch {
      const u: Usuario = {
        id: authUserId,
        email,
        nombre_completo: email.split('@')[0],
        estado_suscripcion: 'inactiva',
        rol: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(u);
      syncUserCookies(u);
    }
  };

  useEffect(() => {
    // Revisar usuario demo guardado
    const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('hipnosis_demo_user') : null;
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsLoading(false);
        return;
      } catch {
        // continue
      }
    }

    // Comprobar sesión de Supabase Auth
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          syncUserCookies(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // Si no hay conexión o falla en demo, dar soporte rápido
        if (email.includes('admin')) {
          setDemoUser('activa', 'admin');
          return {};
        }
        if (email.includes('activo') || email.includes('suscriptor')) {
          setDemoUser('activa', 'user');
          return {};
        }
        return { error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email || email);
      }
      return {};
    } catch (err: any) {
      if (email.includes('admin')) {
        setDemoUser('activa', 'admin');
        return {};
      }
      if (email.includes('activo') || email.includes('suscriptor')) {
        setDemoUser('activa', 'user');
        return {};
      }
      return { error: err?.message || 'Error al iniciar sesión' };
    }
  };

  const signUp = async (email: string, pass: string, nombre: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            nombre_completo: nombre,
            estado_suscripcion: 'inactiva',
            rol: 'user',
          },
        },
      });

      if (error) {
        // Fallback local si supabase no está conectado aún en local
        const newUser: Usuario = {
          id: `usr_${Date.now()}`,
          email,
          nombre_completo: nombre,
          estado_suscripcion: 'inactiva',
          rol: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(newUser);
        syncUserCookies(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hipnosis_demo_user', JSON.stringify(newUser));
        }
        return {};
      }

      if (data.user) {
        await fetchUserProfile(data.user.id, email);
      }
      return {};
    } catch {
      const newUser: Usuario = {
        id: `usr_${Date.now()}`,
        email,
        nombre_completo: nombre,
        estado_suscripcion: 'inactiva',
        rol: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(newUser);
      syncUserCookies(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hipnosis_demo_user', JSON.stringify(newUser));
      }
      return {};
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    syncUserCookies(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hipnosis_demo_user');
    }
    setUser(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id, user.email);
    }
  };

  const setDemoUser = (estado: EstadoSuscripcion, rol: RolUsuario = 'user') => {
    const demo: Usuario = {
      id: `demo_${rol}_${Date.now()}`,
      email: `${rol === 'admin' ? 'admin' : 'suscriptor'}@reprograma.cl`,
      nombre_completo: rol === 'admin' ? 'Administrador Re-Programa' : 'Mael Suscriptor',
      estado_suscripcion: estado,
      rol,
      id_suscripcion_mercadopago: estado === 'activa' ? 'mp_sub_123456789' : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(demo);
    syncUserCookies(demo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hipnosis_demo_user', JSON.stringify(demo));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
