'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Usuario, EstadoSuscripcion, RolUsuario } from '@/types/database';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string; estado_suscripcion?: EstadoSuscripcion }>;
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

  const fetchUserProfile = async (uid: string, email: string): Promise<Usuario> => {
    try {
      const userDocRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const u: Usuario = {
          id: uid,
          email: data.email || email,
          nombre_completo: data.nombre_completo || email.split('@')[0],
          estado_suscripcion: data.estado_suscripcion || 'inactiva',
          rol: data.rol || 'user',
          id_suscripcion_mercadopago: data.id_suscripcion_mercadopago || null,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
        setUser(u);
        syncUserCookies(u);
        return u;
      } else {
        // Si el documento en Firestore aún no existe, crearlo
        const newUserData: Usuario = {
          id: uid,
          email,
          nombre_completo: email.split('@')[0],
          estado_suscripcion: 'inactiva',
          rol: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDoc(userDocRef, newUserData);
        setUser(newUserData);
        syncUserCookies(newUserData);
        return newUserData;
      }
    } catch (err) {
      console.warn('Error al obtener perfil en Firestore:', err);
      const fallbackUser: Usuario = {
        id: uid,
        email,
        nombre_completo: email.split('@')[0],
        estado_suscripcion: 'inactiva',
        rol: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(fallbackUser);
      syncUserCookies(fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    // Revisar si hay un usuario demo guardado
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

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await fetchUserProfile(firebaseUser.uid, firebaseUser.email || '');
        } else {
          setUser(null);
          syncUserCookies(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error?: string; estado_suscripcion?: EstadoSuscripcion }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const u = await fetchUserProfile(userCredential.user.uid, userCredential.user.email || email);
      return { estado_suscripcion: u.estado_suscripcion };
    } catch (err: any) {
      // Si Firebase no tiene credenciales en dev o es usuario demo:
      if (email.includes('admin')) {
        setDemoUser('activa', 'admin');
        return { estado_suscripcion: 'activa' };
      }
      if (email.includes('activo') || email.includes('suscriptor')) {
        setDemoUser('activa', 'user');
        return { estado_suscripcion: 'activa' };
      }
      if (email.includes('inactivo')) {
        setDemoUser('inactiva', 'user');
        return { estado_suscripcion: 'inactiva' };
      }
      return { error: err?.message || 'Error al iniciar sesión con Firebase' };
    }
  };

  const signUp = async (email: string, pass: string, nombre: string): Promise<{ error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      try {
        await updateProfile(userCredential.user, { displayName: nombre });
      } catch {
        // ignore profile displayName error
      }

      // Crear documento en la colección 'usuarios' con su uid, email y estado_suscripcion: "inactiva"
      const newDoc = {
        uid,
        id: uid,
        email,
        nombre_completo: nombre,
        estado_suscripcion: 'inactiva' as EstadoSuscripcion,
        rol: 'user' as RolUsuario,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'usuarios', uid), newDoc);

      const u: Usuario = {
        id: uid,
        email,
        nombre_completo: nombre,
        estado_suscripcion: 'inactiva',
        rol: 'user',
        created_at: newDoc.created_at,
        updated_at: newDoc.updated_at,
      };

      setUser(u);
      syncUserCookies(u);
      return {};
    } catch (err: any) {
      // Fallback local en desarrollo
      const fallbackId = `usr_${Date.now()}`;
      const newUser: Usuario = {
        id: fallbackId,
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
      await firebaseSignOut(auth);
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
    if (auth.currentUser) {
      await fetchUserProfile(auth.currentUser.uid, auth.currentUser.email || '');
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
