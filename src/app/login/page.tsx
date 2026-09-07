'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Feather } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const { signIn, setDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      router.push(redirectTo);
    }
  };

  const handleQuickDemo = (role: 'user' | 'admin') => {
    setDemoUser('activa', role);
    router.push(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Cabecera */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#a55850] flex items-center justify-center text-white shadow-lg shadow-[#a55850]/20">
          <Feather className="w-6 h-6" />
        </div>
        <h1 className="font-serif-persona text-3xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
          Bienvenido a tu refugio
        </h1>
        <p className="text-xs sm:text-sm text-[#a89b97] font-light leading-relaxed">
          Ingresa a tu cuenta para continuar con tus sesiones de calma y reprogramación mental.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-[#2b1716] border border-[#a55850]/40 flex items-center gap-2.5 text-xs text-[#d8aba1]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#a55850]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tarjeta de Formulario Minimalista */}
      <div className="p-8 rounded-3xl bg-[#1c1514] border border-[#3b2c29] shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#ece5e2] mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6f6b]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#140f0e] border border-[#332623] text-[#fbf7f4] placeholder-[#7d6f6b] text-sm focus:outline-none focus:border-[#a55850] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#ece5e2] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6f6b]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#140f0e] border border-[#332623] text-[#fbf7f4] placeholder-[#7d6f6b] text-sm focus:outline-none focus:border-[#a55850] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-sm shadow-xl shadow-[#a55850]/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 border border-[#a55850]"
          >
            {loading ? 'Entrando a tu refugio...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso rápido de prueba */}
        <div className="pt-4 border-t border-[#2d2220] text-center space-y-2.5">
          <span className="text-[11px] text-[#7d6f6b] block">
            Acceso Rápido para Testing / Demostración:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              className="px-3 py-1.5 rounded-full bg-[#140f0e] hover:bg-[#251d1c] text-[#b98d76] text-xs font-medium border border-[#332623] transition-colors"
            >
              Suscriptor Activo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-1.5 rounded-full bg-[#140f0e] hover:bg-[#251d1c] text-[#d8aba1] text-xs font-medium border border-[#332623] transition-colors"
            >
              Administrador
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#a89b97]">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="text-[#b98d76] hover:text-[#d8aba1] font-semibold underline">
          Empieza aquí tu suscripción
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 font-sans-persona">
      <Suspense fallback={<div className="h-64 rounded-3xl bg-[#1c1514] animate-pulse w-full max-w-md" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
