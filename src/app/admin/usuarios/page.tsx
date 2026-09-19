'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { Usuario, EstadoSuscripcion, RolUsuario } from '@/types/database';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EstadoSuscripcion>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'usuarios'));
      const list: Usuario[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          email: data.email || '',
          nombre_completo: data.nombre_completo || '',
          estado_suscripcion: data.estado_suscripcion || 'inactiva',
          rol: data.rol || 'user',
          id_suscripcion_mercadopago: data.id_suscripcion_mercadopago || null,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        });
      });
      setUsers(list);
    } catch (err) {
      console.warn('Error al cargar usuarios de Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleChangeStatus = async (userId: string, newStatus: EstadoSuscripcion) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        estado_suscripcion: newStatus,
        updated_at: new Date().toISOString(),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, estado_suscripcion: newStatus } : u))
      );
      showToast(`Estado de membresía actualizado a: ${newStatus}`);
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar estado en Firestore');
    }
  };

  const handleChangeRole = async (userId: string, newRole: RolUsuario) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        rol: newRole,
        updated_at: new Date().toISOString(),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
      );
      showToast(
        newRole === 'admin'
          ? '⭐ Usuario ascendido a Administrador (Verá el botón Panel Admin)'
          : 'Rol cambiado a Usuario Regular (Ya no verá el Panel Admin)'
      );
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar rol en Firestore');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchStatus = statusFilter === 'all' ? true : u.estado_suscripcion === statusFilter;
    const matchRole = roleFilter === 'all' ? true : u.rol === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = query
      ? u.email.toLowerCase().includes(query) ||
        (u.nombre_completo && u.nombre_completo.toLowerCase().includes(query)) ||
        (u.id_suscripcion_mercadopago && u.id_suscripcion_mercadopago.toLowerCase().includes(query))
      : true;
    return matchStatus && matchRole && matchSearch;
  });

  const getStatusBadge = (status: EstadoSuscripcion) => {
    switch (status) {
      case 'activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="w-3 h-3" /> Activa
          </span>
        );
      case 'inactiva':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3" /> Inactiva
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#140f0e] text-[#a89b97] border border-[#2d2220]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans-persona">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#a55850] text-white shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 border border-[#b8665d]">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2220] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[11px] font-semibold text-[#b98d76] mb-2">
            <Users className="w-3.5 h-3.5 text-[#a55850]" />
            <span>Base de Miembros & Control de Acceso (Firestore)</span>
          </div>
          <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
            Asigna qué usuarios tienen acceso al <strong>Panel de Administrador</strong> arriba y gestiona el estado de su membresía.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-[#a89b97] bg-[#1e1716] px-3.5 py-2 rounded-2xl border border-[#2d2220]">
            Admins: <strong className="text-[#d8aba1]">{users.filter((u) => u.rol === 'admin').length}</strong>
          </div>
          <div className="text-xs text-[#a89b97] bg-[#1e1716] px-3.5 py-2 rounded-2xl border border-[#2d2220]">
            Total: <strong className="text-[#fbf7f4]">{users.length}</strong>
          </div>
        </div>
      </div>

      {/* Explicación de Permisos de Administrador */}
      <div className="p-4 rounded-2xl bg-[#241816] border border-[#a55850]/40 flex items-start gap-3 text-xs text-[#d8aba1]">
        <Shield className="w-5 h-5 text-[#a55850] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#fbf7f4]">Control Exclusivo de Administradores</p>
          <p className="text-[#a89b97] font-light leading-relaxed">
            Solo los usuarios con rol <strong>Administrador</strong> podrán ver y presionar el botón <strong>«Panel Admin»</strong> en la barra de navegación superior. Para cualquier usuario regular, dicha opción permanecerá completamente invisible e inaccesible.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89b97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por correo o nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e1716] border border-[#3b2c29] text-xs text-[#ece5e2] placeholder-[#7d6f6b] focus:outline-none focus:border-[#a55850]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Rol */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#140f0e] border border-[#2d2220]">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-[#a55850] text-white'
                  : 'text-[#a89b97] hover:text-[#fbf7f4]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-[#a55850] text-white'
                  : 'text-[#a89b97] hover:text-[#fbf7f4]'
              }`}
            >
              ⭐ Admins ({users.filter((u) => u.rol === 'admin').length})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === 'user'
                  ? 'bg-[#a55850] text-white'
                  : 'text-[#a89b97] hover:text-[#fbf7f4]'
              }`}
            >
              Usuarios ({users.filter((u) => u.rol === 'user').length})
            </button>
          </div>

          {/* Filtro por Membresía */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#2d2220] text-white'
                  : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
              }`}
            >
              Todas Membresías
            </button>
            <button
              onClick={() => setStatusFilter('activa')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                statusFilter === 'activa'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter('inactiva')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                statusFilter === 'inactiva'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a89b97] bg-[#1e1716] rounded-3xl border border-[#2d2220] animate-pulse">
          Consultando usuarios en Firestore...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
          <Users className="w-12 h-12 mx-auto text-[#b98d76] opacity-60" />
          <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
            No se encontraron usuarios
          </h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light leading-relaxed">
            Aún no hay registros en la colección `usuarios` o no coinciden con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="border border-[#3b2c29] rounded-3xl overflow-hidden bg-[#1e1716] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#140f0e] text-[#7d6f6b] uppercase text-[10px] tracking-wider border-b border-[#2d2220]">
                <tr>
                  <th className="py-3.5 px-5">Usuario</th>
                  <th className="py-3.5 px-4">Rol / Permiso Admin</th>
                  <th className="py-3.5 px-4">Estado Membresía</th>
                  <th className="py-3.5 px-4">ID Mercado Pago</th>
                  <th className="py-3.5 px-4 text-right">Membresía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2220] text-[#c7b9b4]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#251d1c]/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2d2220] text-[#b98d76] flex items-center justify-center font-bold text-xs shrink-0 border border-[#3b2c29]">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-[#fbf7f4] truncate">
                            {u.nombre_completo || u.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-[#7d6f6b] truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* SELECTOR DE ROL: ADMINISTRADOR VS USUARIO */}
                      {u.email.toLowerCase().trim() === 'vargasmael@gmail.com' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#a55850]/20 border border-[#a55850] text-[#fbf7f4] font-semibold text-xs shadow-sm">
                          <Shield className="w-3.5 h-3.5 text-[#a55850]" />
                          ⭐ Master Admin (Dueño)
                        </span>
                      ) : (
                        <select
                          value={u.rol}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as RolUsuario)}
                          className={`px-3 py-1.5 rounded-xl border text-xs focus:outline-none cursor-pointer font-medium transition-all ${
                            u.rol === 'admin'
                              ? 'bg-[#a55850]/20 border-[#a55850] text-[#fbf7f4] font-semibold'
                              : 'bg-[#140f0e] border-[#2d2220] text-[#a89b97] hover:border-[#3b2c29]'
                          }`}
                        >
                          <option value="user">Usuario (Sin Panel)</option>
                          <option value="admin">⭐ Administrador (Ve Panel Admin)</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(u.estado_suscripcion)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#8b7d78]">
                      {u.id_suscripcion_mercadopago || 'Sin suscripción activa'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.estado_suscripcion}
                        onChange={(e) =>
                          handleChangeStatus(u.id, e.target.value as EstadoSuscripcion)
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-xs text-[#ece5e2] focus:outline-none focus:border-[#a55850] cursor-pointer"
                      >
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
