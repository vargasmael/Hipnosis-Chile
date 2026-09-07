'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail, User, CheckCircle2, AlertCircle, Feather } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signUp(email, password, nombre);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      // Redirigir al muro de activación de membresía
      router.push('/suscripcion');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 font-sans-persona">
      <div className="w-full max-w-md space-y-8">
        {/* Cabecera */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#a55850] flex items-center justify-center text-white shadow-lg shadow-[#a55850]/20">
            <Feather className="w-6 h-6" />
          </div>
          <h1 className="font-serif-persona text-3xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Comienza a sanar hoy
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] font-light leading-relaxed">
            Paso 1 de 2: Crea tu cuenta privada para acceder a la biblioteca de reprogramación mental.
          </p>
        </div>

        {/* Resumen del plan */}
        <div className="p-4 rounded-3xl bg-[#1e1716] border border-[#3b2c29] flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs text-[#b98d76] font-semibold block">Membresía Ilimitada</span>
            <span className="text-xs text-[#9c8e8a] font-light">Acceso 24/7 sin restricciones</span>
          </div>
          <span className="font-serif-persona text-base font-normal text-[#fbf7f4]">
            $9.990 CLP / mes
          </span>
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
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6f6b]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Francisca Morales"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#140f0e] border border-[#332623] text-[#fbf7f4] placeholder-[#7d6f6b] text-sm focus:outline-none focus:border-[#a55850] transition-colors"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#140f0e] border border-[#332623] text-[#fbf7f4] placeholder-[#7d6f6b] text-sm focus:outline-none focus:border-[#a55850] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-sm shadow-xl shadow-[#a55850]/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 border border-[#a55850]"
            >
              {loading ? 'Creando cuenta...' : 'Continuar a Activar Membresía'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-[#7d6f6b] text-center leading-relaxed font-light">
            Al registrarte, confirmas haber leído nuestros{' '}
            <Link href="/terminos" className="text-[#a89b97] underline">
              Términos
            </Link>{' '}
            y el{' '}
            <Link href="/terminos" className="text-[#a89b97] underline">
              Aviso de Uso Responsable
            </Link>.
          </p>
        </div>

        <div className="text-center text-xs text-[#a89b97]">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#b98d76] hover:text-[#d8aba1] font-semibold underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
