'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  CreditCard,
  Compass,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, setDemoUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/registro';
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#140f0e]/90 backdrop-blur-md border-b border-[#2d2220]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#a55850] p-0.5 shadow-md shadow-[#a55850]/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <span className="font-serif-persona text-lg font-normal tracking-tight text-[#fbf7f4] flex items-center gap-1">
              Re<span className="text-[#b98d76] font-normal italic">-Programa</span>
            </span>
            <span className="block text-[10px] text-[#a89b97] tracking-wider uppercase font-medium -mt-1 font-sans-persona">
              Tu Refugio Mental
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#b98d76] font-semibold'
                    : 'text-[#a89b97] hover:text-[#fbf7f4]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/biblioteca"
                className={`transition-colors ${
                  pathname === '/biblioteca'
                    ? 'text-[#b98d76] font-semibold'
                    : 'text-[#a89b97] hover:text-[#fbf7f4]'
                }`}
              >
                Biblioteca
              </Link>
              <Link
                href="/buscar"
                className={`transition-colors ${
                  pathname === '/buscar'
                    ? 'text-[#b98d76] font-semibold'
                    : 'text-[#a89b97] hover:text-[#fbf7f4]'
                }`}
              >
                Explorar & Buscar
              </Link>
              <Link
                href="/favoritos"
                className={`transition-colors ${
                  pathname === '/favoritos'
                    ? 'text-[#b98d76] font-semibold'
                    : 'text-[#a89b97] hover:text-[#fbf7f4]'
                }`}
              >
                Mis Favoritos
              </Link>

              {user.rol === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1716] border border-[#a55850]/50 text-[#d8aba1] hover:text-white hover:border-[#a55850] shadow-sm transition-colors text-xs font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#a55850]" />
                  Panel Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/#beneficios" className="text-[#a89b97] hover:text-[#fbf7f4] transition-colors">
                Beneficios
              </Link>
              <Link href="/#sesiones" className="text-[#a89b97] hover:text-[#fbf7f4] transition-colors">
                Sesiones
              </Link>
              <Link href="/#membresia" className="text-[#a89b97] hover:text-[#fbf7f4] transition-colors">
                Planes & Precios
              </Link>
              <Link href="/#faq" className="text-[#a89b97] hover:text-[#fbf7f4] transition-colors">
                Preguntas Frecuentes
              </Link>
            </>
          )}
        </nav>

        {/* BOTONES DERECHA & PERFIL */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#1c1514] border border-[#2d2220] hover:border-[#3b2c29] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#a55850] to-[#b98d76] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <span className="block text-xs font-medium text-[#fbf7f4] truncate max-w-[120px]">
                    {user.nombre_completo || user.email.split('@')[0]}
                  </span>
                  <span
                    className={`block text-[10px] font-semibold ${
                      user.estado_suscripcion === 'activa'
                        ? 'text-teal-400'
                        : 'text-[#d8aba1]'
                    }`}
                  >
                    {user.estado_suscripcion === 'activa' ? 'Membresía Activa' : 'Sin Suscripción'}
                  </span>
                </div>
              </button>

              {/* DROPDOWN USUARIO */}
              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1e1716] border border-[#2d2220] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#2d2220]">
                    <p className="text-xs text-[#a89b97]">Sesión iniciada como</p>
                    <p className="text-xs font-semibold text-[#fbf7f4] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px]">
                      {user.estado_suscripcion === 'activa' ? (
                        <span className="flex items-center gap-1 text-teal-400">
                          <CheckCircle2 className="w-3 h-3" /> Suscriptor Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#d8aba1]">
                          <AlertCircle className="w-3 h-3" /> Membresía Inactiva
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/perfil"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#c7b9b4] hover:text-white hover:bg-[#251d1c]"
                  >
                    <User className="w-3.5 h-3.5 text-[#b98d76]" />
                    Mi Cuenta y Membresía
                  </Link>

                  {user.estado_suscripcion !== 'activa' && (
                    <Link
                      href="/suscripcion"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#d8aba1] hover:bg-[#251d1c] font-semibold"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Activar Membresía Mensual
                    </Link>
                  )}

                  {user.rol === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#d8aba1] hover:bg-[#251d1c] font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#a55850]" />
                      Panel Administrador
                    </Link>
                  )}

                  <div className="border-t border-[#2d2220] my-1" />

                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-[#251d1c] text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-medium text-[#ece5e2] hover:text-white hover:bg-[#1e1716] border border-transparent hover:border-[#3b2c29] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#a55850] hover:bg-[#b8665d] text-white shadow-md shadow-[#a55850]/25 transition-all hover:scale-[1.02] active:scale-95 border border-[#a55850]"
              >
                Suscribirse
              </Link>
            </div>
          )}

          {/* BOTÓN MENÚ MÓVIL */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#a89b97] hover:text-white rounded-lg hover:bg-[#1e1716]"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuOpen && (
        <div className="md:hidden border-b border-[#2d2220] bg-[#140f0e]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3">
          {user ? (
            <div className="space-y-1">
              <Link
                href="/biblioteca"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Biblioteca
              </Link>
              <Link
                href="/buscar"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Explorar & Categorías
              </Link>
              <Link
                href="/favoritos"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Mis Favoritos
              </Link>
              <Link
                href="/perfil"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Mi Cuenta & Membresía
              </Link>
              {user.rol === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-[#d8aba1] hover:bg-[#1e1716] font-semibold"
                >
                  Panel de Administración
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/#beneficios"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Beneficios
              </Link>
              <Link
                href="/#sesiones"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Sesiones Disponibles
              </Link>
              <Link
                href="/#membresia"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#ece5e2] hover:bg-[#1e1716]"
              >
                Planes & Precios
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#d8aba1] font-semibold"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
