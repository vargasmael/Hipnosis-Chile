'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Compass, Heart, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // No mostrar en landing, auth screens, panel de admin o en la vista de reproductor de sesión
  const isPublicLanding = pathname === '/' || pathname === '/login' || pathname === '/registro';
  if ((!user && isPublicLanding) || pathname.startsWith('/admin') || pathname.startsWith('/sesion')) return null;

  const navItems = [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Explorar', href: '/explorar', icon: Compass },
    { label: 'Favoritos', href: '/favoritos', icon: Heart },
    { label: 'Perfil', href: '/perfil', icon: User },
  ];

  return (
    <nav
      aria-label="Navegación inferior móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#140f0e]/95 backdrop-blur-2xl border-t border-[#2d2220] px-3 pt-2 pb-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-2xl relative ${
                isActive
                  ? 'text-[#fbf7f4]'
                  : 'text-[#8b7d78] hover:text-[#ece5e2]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#a55850] text-white shadow-md shadow-[#a55850]/30 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-wide ${isActive ? 'font-semibold text-[#b98d76]' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
