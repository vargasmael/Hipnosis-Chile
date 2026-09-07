'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Film,
  FolderTree,
  Users,
  Sparkles,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard Admin',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Sesiones',
      href: '/admin/sesiones',
      icon: Film,
      exact: false,
    },
    {
      name: 'Categorías',
      href: '/admin/categorias',
      icon: FolderTree,
      exact: false,
    },
    {
      name: 'Usuarios',
      href: '/admin/usuarios',
      icon: Users,
      exact: false,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#140f0e] text-[#ece5e2] flex flex-col md:flex-row font-sans-persona">
      {/* ------------------------------------------------------------- */}
      {/* SIDEBAR EXCLUSIVA DE ESCRITORIO                               */}
      {/* ------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#181211] border-r border-[#2d2220] shrink-0 sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="p-6 border-b border-[#2d2220] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#a55850] flex items-center justify-center text-white shadow-md shadow-[#a55850]/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-persona text-base font-normal text-[#fbf7f4] block">
                Re<span className="text-[#b98d76] italic">-Programa</span>
              </span>
              <span className="text-[10px] text-[#a55850] font-semibold uppercase tracking-wider block font-sans-persona">
                Panel Administrativo
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#7d6f6b] block mb-3 font-sans-persona">
            Gestión Central
          </span>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#a55850] text-white shadow-lg shadow-[#a55850]/20 font-semibold'
                    : 'text-[#a89b97] hover:text-[#fbf7f4] hover:bg-[#201817]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#b98d76]'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </div>

        {/* Footer Admin Sidebar */}
        <div className="p-4 border-t border-[#2d2220] space-y-2.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#140f0e] hover:bg-[#201817] border border-[#2d2220] text-xs text-[#a89b97] hover:text-[#fbf7f4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#b98d76]" />
            <span>Volver a la App</span>
          </Link>

          <div className="flex items-center justify-between pt-2 px-1 text-xs">
            <div className="min-w-0 pr-2">
              <p className="font-semibold text-white truncate text-xs">
                {user?.nombre_completo || 'Admin'}
              </p>
              <p className="text-[10px] text-[#7d6f6b] truncate">
                {user?.email || 'admin@re-programa.cl'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-[#7d6f6b] hover:text-red-400 rounded-lg hover:bg-[#201817] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* HEADER MÓVIL CON MENÚ HAMBURGUESA                             */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden sticky top-0 z-30 bg-[#181211]/95 backdrop-blur-md border-b border-[#2d2220] px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#a55850] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-serif-persona text-sm font-normal text-[#fbf7f4]">
            Re-Programa <span className="text-[#a55850] font-sans-persona text-xs">Admin</span>
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2]"
          aria-label="Abrir menú de navegación"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 z-40 bg-[#181211] border-b border-[#2d2220] p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium ${
                  isActive
                    ? 'bg-[#a55850] text-white font-semibold'
                    : 'text-[#a89b97] hover:bg-[#201817]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#2d2220] flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-[#b98d76] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a la App
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs text-red-400 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ÁREA DE CONTENIDO PRINCIPAL                                   */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
