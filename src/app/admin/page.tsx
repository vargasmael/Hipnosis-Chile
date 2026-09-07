'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  FolderTree,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { MOCK_CATEGORIAS, MOCK_SESIONES, MOCK_USUARIOS } from '@/lib/data/mockData';
import { Sesion, Categoria, Usuario } from '@/types/database';

export default function AdminDashboardOverview() {
  const [sessions, setSessions] = useState<Sesion[]>(MOCK_SESIONES);
  const [categories, setCategories] = useState<Categoria[]>(MOCK_CATEGORIAS);
  const [users, setUsers] = useState<Usuario[]>(MOCK_USUARIOS);

  useEffect(() => {
    // Sincronizar si hay datos locales guardados
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem('reprograma_admin_sesiones');
        if (savedSessions) setSessions(JSON.parse(savedSessions));

        const savedCats = localStorage.getItem('reprograma_admin_categorias');
        if (savedCats) setCategories(JSON.parse(savedCats));

        const savedUsers = localStorage.getItem('reprograma_admin_usuarios');
        if (savedUsers) setUsers(JSON.parse(savedUsers));
      } catch {
        // fallback
      }
    }
  }, []);

  const activeUsersCount = users.filter((u) => u.estado_suscripcion === 'activa').length;
  const featuredSessionsCount = sessions.filter((s) => s.destacado).length;

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans-persona">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2220] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[11px] font-semibold text-[#b98d76] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a55850]" />
            <span>Panel de Administración Global</span>
          </div>
          <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
            Monitoreo general de la plataforma Re-Programa, catálogo y miembros activos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sesiones"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-lg shadow-[#a55850]/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Gestionar Sesiones</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a89b97] font-medium">Suscriptores Activos</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif-persona text-[#fbf7f4]">{activeUsersCount}</span>
            <span className="text-[11px] text-[#7d6f6b] block mt-1">
              De {users.length} usuarios registrados
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a89b97] font-medium">Total de Sesiones</span>
            <div className="w-8 h-8 rounded-xl bg-[#a55850]/20 text-[#a55850] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif-persona text-[#fbf7f4]">{sessions.length}</span>
            <span className="text-[11px] text-[#7d6f6b] block mt-1">
              {featuredSessionsCount} marcadas como destacadas
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a89b97] font-medium">Categorías Activas</span>
            <div className="w-8 h-8 rounded-xl bg-[#b98d76]/20 text-[#b98d76] flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-serif-persona text-[#fbf7f4]">{categories.length}</span>
            <span className="text-[11px] text-[#7d6f6b] block mt-1">
              Áreas de sanación y enfoque
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a89b97] font-medium">Ingresos Recurrentes (MRR)</span>
            <div className="w-8 h-8 rounded-xl bg-[#a55850]/20 text-[#d8aba1] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif-persona text-[#fbf7f4]">
              ${(activeUsersCount * 9990).toLocaleString('es-CL')} CLP
            </span>
            <span className="text-[11px] text-[#7d6f6b] block mt-1">
              Cobro mensual Mercado Pago
            </span>
          </div>
        </div>
      </div>

      {/* Resumen rápido de secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Sesiones */}
        <div className="p-6 rounded-3xl bg-[#1e1716] border border-[#3b2c29] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#a55850]" />
              <h3 className="font-serif-persona text-lg text-[#fbf7f4]">Últimas Sesiones</h3>
            </div>
            <Link
              href="/admin/sesiones"
              className="text-xs text-[#b98d76] hover:text-[#d8aba1] flex items-center gap-1 font-medium"
            >
              Ver todas ({sessions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#2d2220]">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={s.url_imagen_portada || ''}
                    alt={s.titulo}
                    className="w-10 h-10 rounded-xl object-cover bg-[#2d2220] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-[#fbf7f4] truncate">{s.titulo}</p>
                    <span className="text-[10px] text-[#a89b97]">
                      {s.categoria?.nombre} • {Math.round(s.duracion / 60)} min
                    </span>
                  </div>
                </div>
                {s.destacado && (
                  <span className="text-[10px] text-[#b98d76] bg-[#140f0e] px-2 py-0.5 rounded-full border border-[#2d2220] shrink-0">
                    Destacada
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Usuarios Registrados */}
        <div className="p-6 rounded-3xl bg-[#1e1716] border border-[#3b2c29] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#b98d76]" />
              <h3 className="font-serif-persona text-lg text-[#fbf7f4]">Miembros Recientes</h3>
            </div>
            <Link
              href="/admin/usuarios"
              className="text-xs text-[#b98d76] hover:text-[#d8aba1] flex items-center gap-1 font-medium"
            >
              Ver todos ({users.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#2d2220]">
            {users.slice(0, 4).map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-xs text-[#fbf7f4] truncate">
                    {u.nombre_completo || u.email}
                  </p>
                  <span className="text-[10px] text-[#7d6f6b] truncate block">{u.email}</span>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium shrink-0 ${
                    u.estado_suscripcion === 'activa'
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                      : u.estado_suscripcion === 'cancelada'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {u.estado_suscripcion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
