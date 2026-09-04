'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Film,
  FolderTree,
  Users,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Edit2,
  Star
} from 'lucide-react';
import { MOCK_CATEGORIAS, MOCK_SESIONES } from '@/lib/data/mockData';
import { Sesion, Categoria, Usuario } from '@/types/database';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'sesiones' | 'destacados' | 'categorias' | 'usuarios'>('sesiones');
  const [sessions, setSessions] = useState<Sesion[]>(MOCK_SESIONES);
  const [categories, setCategories] = useState<Categoria[]>(MOCK_CATEGORIAS);

  // Lista mock de usuarios registrados para gestión
  const [usersList, setUsersList] = useState<Usuario[]>([
    {
      id: 'usr-1',
      email: 'camila.silva@gmail.com',
      nombre_completo: 'Camila Silva',
      estado_suscripcion: 'activa',
      id_suscripcion_mercadopago: 'mp_sub_994812301',
      rol: 'user',
      created_at: '2026-08-15T10:00:00Z',
      updated_at: '2026-09-01T12:00:00Z',
    },
    {
      id: 'usr-2',
      email: 'felipe.morales@outlook.com',
      nombre_completo: 'Felipe Morales',
      estado_suscripcion: 'activa',
      id_suscripcion_mercadopago: 'mp_sub_882910394',
      rol: 'user',
      created_at: '2026-08-20T14:30:00Z',
      updated_at: '2026-09-02T09:15:00Z',
    },
    {
      id: 'usr-3',
      email: 'andrea.gonzalez@vtr.net',
      nombre_completo: 'Andrea González',
      estado_suscripcion: 'inactiva',
      id_suscripcion_mercadopago: null,
      rol: 'user',
      created_at: '2026-08-25T18:00:00Z',
      updated_at: '2026-08-25T18:00:00Z',
    },
    {
      id: 'usr-4',
      email: 'admin@hipnosischile.cl',
      nombre_completo: 'Administrador Hipnosis Chile',
      estado_suscripcion: 'activa',
      id_suscripcion_mercadopago: 'mp_sub_internal_admin',
      rol: 'admin',
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    },
  ]);

  // Estados formulario nueva sesión
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [uploadingR2, setUploadingR2] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || '');
  const [newDurationMin, setNewDurationMin] = useState(15);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newAuthor, setNewAuthor] = useState('Dra. Valentina Montes');
  const [newMediaType, setNewMediaType] = useState<'audio' | 'video'>('audio');

  // Estados nueva categoría
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Mensaje temporal de éxito
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Simular subida a Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingR2(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', type === 'media' ? 'sessions' : 'covers');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'media') {
          setNewMediaUrl(data.url);
          showToast('Archivo multimedia subido con éxito a Cloudflare R2');
        } else {
          setNewCoverUrl(data.url);
          showToast('Portada subida con éxito a Cloudflare R2');
        }
      }
    } catch {
      showToast('Error al subir archivo');
    } finally {
      setUploadingR2(false);
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Sesion = {
      id: `ses-${Date.now()}`,
      titulo: newTitle,
      descripcion: newDesc,
      id_categoria: newCatId,
      categoria: categories.find((c) => c.id === newCatId),
      duracion: newDurationMin * 60,
      url_archivo_multimedia: newMediaUrl || 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
      url_imagen_portada: newCoverUrl || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
      tipo_multimedia: newMediaType,
      destacado: newIsFeatured,
      guia_o_autor: newAuthor,
      created_at: new Date().toISOString(),
    };

    setSessions([created, ...sessions]);
    setShowNewSessionModal(false);
    showToast('Sesión creada exitosamente');
    // Reset
    setNewTitle('');
    setNewDesc('');
    setNewMediaUrl('');
    setNewCoverUrl('');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    showToast('Sesión eliminada');
  };

  const handleToggleFeatured = (id: string) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, destacado: !s.destacado } : s))
    );
    showToast('Estado destacado actualizado');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat: Categoria = {
      id: `cat-${Date.now()}`,
      nombre: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      descripcion: newCatDesc,
      orden: categories.length + 1,
    };
    setCategories([...categories, newCat]);
    setShowNewCategoryModal(false);
    setNewCatName('');
    setNewCatDesc('');
    showToast('Categoría creada');
  };

  const handleToggleUserSubscription = (userId: string) => {
    setUsersList(
      usersList.map((u) => {
        if (u.id === userId) {
          const nextState = u.estado_suscripcion === 'activa' ? 'inactiva' : 'activa';
          return { ...u, estado_suscripcion: nextState };
        }
        return u;
      })
    );
    showToast('Estado de usuario actualizado');
  };

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Encabezado Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Panel de Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Administración Hipnosis Chile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión centralizada de catálogo, archivos en Cloudflare R2, categorías y suscriptores.
          </p>
        </div>

        {/* Resumen Métricas Rápidas */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="block text-lg font-bold text-teal-400">
              {usersList.filter((u) => u.estado_suscripcion === 'activa').length}
            </span>
            <span className="text-slate-400 text-[10px]">Suscriptores Activos</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="block text-lg font-bold text-indigo-400">{sessions.length}</span>
            <span className="text-slate-400 text-[10px]">Sesiones en R2</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('sesiones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'sesiones'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Film className="w-4 h-4" />
          CRUD de Sesiones ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTab('destacados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'destacados'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          Selección de Destacados ({sessions.filter((s) => s.destacado).length})
        </button>

        <button
          onClick={() => setActiveTab('categorias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'categorias'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Categorías ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'usuarios'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Gestión de Usuarios ({usersList.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PESTAÑA 1: CRUD SESIONES                                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sesiones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Catálogo de Sesiones</h2>
            <button
              onClick={() => setShowNewSessionModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Sesión
            </button>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Sesión / Portada</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Duración</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Destacado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={session.url_imagen_portada || ''}
                          alt={session.titulo}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">
                            {session.titulo}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {session.guia_o_autor}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-indigo-400">
                        {session.categoria?.nombre || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        {Math.round(session.duracion / 60)} min
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {session.tipo_multimedia}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(session.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            session.destacado
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {session.destacado ? '★ Destacada' : 'Normal'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Eliminar sesión"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PESTAÑA 2: SELECCIÓN DE DESTACADOS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'destacados' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              Sesiones en Portada de Suscriptores
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en la estrella para activar o remover qué sesiones aparecen en el carrusel principal de la app.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleToggleFeatured(session.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  session.destacado
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={session.url_imagen_portada || ''}
                    alt={session.titulo}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {session.titulo}
                    </h4>
                    <span className="text-[10px] text-indigo-400 block">
                      {session.categoria?.nombre} • {Math.round(session.duracion / 60)} min
                    </span>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    session.destacado
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PESTAÑA 3: CRUD CATEGORÍAS                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Categorías de Contenido</h2>
              <p className="text-xs text-slate-400">Organiza las temáticas del catálogo.</p>
            </div>
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                    Orden #{idx + 1}
                  </span>
                  <button
                    onClick={() => {
                      setCategories(categories.filter((c) => c.id !== cat.id));
                      showToast('Categoría eliminada');
                    }}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white">{cat.nombre}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.descripcion || 'Sin descripción'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PESTAÑA 4: GESTIÓN DE USUARIOS                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Usuarios y Membresías</h2>
            <p className="text-xs text-slate-400">
              Visualiza los suscriptores y alterna manualmente el estado de suscripción para pruebas o atención al cliente.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Rol</th>
                    <th className="py-3.5 px-4">ID Mercado Pago</th>
                    <th className="py-3.5 px-4">Estado Membresía</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{u.email}</span>
                        <span className="text-[10px] text-slate-500">{u.nombre_completo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.rol === 'admin'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {u.id_suscripcion_mercadopago || 'Sin ID activo'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.estado_suscripcion === 'activa'
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {u.estado_suscripcion === 'activa' ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserSubscription(u.id)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-semibold"
                        >
                          {u.estado_suscripcion === 'activa' ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: NUEVA SESIÓN (CON CLOUDFLARE R2 UPLOAD)                */}
      {/* ------------------------------------------------------------- */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Subir Nueva Sesión</h3>
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Reprogramación para Dormir Toda la Noche"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explica el objetivo de la sesión y las técnicas aplicadas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={newDurationMin}
                    onChange={(e) => setNewDurationMin(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Subida Multimedia Cloudflare R2 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-indigo-400 block flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Almacenamiento en Cloudflare R2 (S3)
                </span>

                <div className="space-y-1">
                  <label className="text-slate-400 block">Archivo de Audio / Video:</label>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => handleFileUpload(e, 'media')}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {newMediaUrl && (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ URL asignada: {newMediaUrl}
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <label className="text-slate-400 block">Imagen de Portada (JPG, PNG, WebP):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'cover')}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {newCoverUrl && (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ Portada asignada: {newCoverUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="rounded bg-slate-800 text-indigo-600"
                />
                <label htmlFor="featured" className="text-slate-300">
                  Marcar como sesión destacada en portada
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingR2}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50"
                >
                  {uploadingR2 ? 'Subiendo archivo...' : 'Guardar y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: NUEVA CATEGORÍA                                        */}
      {/* ------------------------------------------------------------- */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Crear Nueva Categoría</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Fobias y Miedos"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Breve descripción de las sesiones bajo este tema..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
