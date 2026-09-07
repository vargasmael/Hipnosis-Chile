'use client';

import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Star,
  Sparkles,
  Clock,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { MOCK_CATEGORIAS, MOCK_SESIONES } from '@/lib/data/mockData';
import { Sesion, Categoria } from '@/types/database';

export default function AdminSesionesPage() {
  const [sessions, setSessions] = useState<Sesion[]>(MOCK_SESIONES);
  const [categories, setCategories] = useState<Categoria[]>(MOCK_CATEGORIAS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modal nueva sesión
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [mediaUrl, setMediaUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [author, setAuthor] = useState('Dra. Valentina Montes');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem('reprograma_admin_sesiones');
        if (savedSessions) setSessions(JSON.parse(savedSessions));

        const savedCats = localStorage.getItem('reprograma_admin_categorias');
        if (savedCats) {
          const parsedCats = JSON.parse(savedCats);
          setCategories(parsedCats);
          setCategoryId(parsedCats[0]?.id || '');
        } else {
          setCategoryId(MOCK_CATEGORIAS[0]?.id || '');
        }
      } catch {
        setCategoryId(MOCK_CATEGORIAS[0]?.id || '');
      }
    }
  }, []);

  const saveToStorage = (updated: Sesion[]) => {
    setSessions(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('reprograma_admin_sesiones', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      if (type === 'media') {
        setMediaUrl('https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3');
        showToast('Audio subido exitosamente (Simulado / R2)');
      } else {
        setCoverUrl('https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80');
        showToast('Portada subida exitosamente (Simulada / R2)');
      }
      setUploading(false);
    }, 600);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === categoryId);
    const newSession: Sesion = {
      id: `ses-${Date.now()}`,
      titulo: title,
      descripcion: description,
      id_categoria: categoryId || categories[0]?.id || 'cat-1',
      categoria: cat || categories[0],
      duracion: durationMinutes * 60,
      url_archivo_multimedia: mediaUrl || 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
      url_imagen_portada: coverUrl || 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80',
      tipo_multimedia: 'audio',
      destacado: isFeatured,
      guia_o_autor: author,
      veces_reproducida: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    saveToStorage(updated);
    setShowModal(false);
    showToast('Nueva sesión publicada con éxito');

    // Reset fields
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setCoverUrl('');
    setIsFeatured(false);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    saveToStorage(updated);
    showToast('Sesión eliminada del catálogo');
  };

  const handleToggleFeatured = (id: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, destacado: !s.destacado } : s));
    saveToStorage(updated);
    showToast('Estado destacado actualizado');
  };

  const filteredSessions = sessions.filter((s) => {
    const matchCategory = selectedCategoryFilter ? s.id_categoria === selectedCategoryFilter : true;
    const matchSearch = searchQuery
      ? s.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guia_o_autor.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans-persona">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#a55850] text-white shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2220] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1716] border border-[#3b2c29] text-[11px] font-semibold text-[#b98d76] mb-2">
            <Film className="w-3.5 h-3.5 text-[#a55850]" />
            <span>Biblioteca de Audios & Frecuencias</span>
          </div>
          <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Gestión de Sesiones
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
            Crea, edita y organiza las inducciones guiadas del catálogo de Re-Programa.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-lg shadow-[#a55850]/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Sesión</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a89b97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar sesión por título o terapeuta..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1e1716] border border-[#3b2c29] text-xs text-[#ece5e2] placeholder-[#7d6f6b] focus:outline-none focus:border-[#a55850]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              selectedCategoryFilter === null
                ? 'bg-[#a55850] text-white'
                : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategoryFilter === c.id
                  ? 'bg-[#a55850] text-white'
                  : 'bg-[#1e1716] text-[#a89b97] hover:text-[#fbf7f4] border border-[#2d2220]'
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Sesiones */}
      <div className="border border-[#3b2c29] rounded-3xl overflow-hidden bg-[#1e1716] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#140f0e] text-[#7d6f6b] uppercase text-[10px] tracking-wider border-b border-[#2d2220]">
              <tr>
                <th className="py-3.5 px-5">Sesión & Portada</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Duración</th>
                <th className="py-3.5 px-4">Destacada</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2220] text-[#c7b9b4]">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-[#251d1c]/50 transition-colors">
                  <td className="py-3.5 px-5 flex items-center gap-3">
                    <img
                      src={session.url_imagen_portada || ''}
                      alt={session.titulo}
                      className="w-11 h-11 rounded-xl object-cover bg-[#2d2220] shrink-0 border border-[#3b2c29]"
                    />
                    <div className="min-w-0 max-w-sm">
                      <p className="font-medium text-xs text-[#fbf7f4] truncate">
                        {session.titulo}
                      </p>
                      <p className="text-[11px] text-[#7d6f6b] truncate mt-0.5">
                        {session.guia_o_autor}
                      </p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#b98d76] font-medium">
                    {session.categoria?.nombre || 'General'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[#a89b97]">
                      <Clock className="w-3.5 h-3.5 text-[#7d6f6b]" />
                      <span>{Math.round(session.duracion / 60)} min</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFeatured(session.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        session.destacado
                          ? 'bg-[#a55850]/20 text-[#d8aba1] border border-[#a55850]/40'
                          : 'bg-[#140f0e] text-[#7d6f6b] hover:text-[#ece5e2] border border-[#2d2220]'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${session.destacado ? 'fill-current' : ''}`} />
                      <span>{session.destacado ? 'Destacada' : 'Normal'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 rounded-xl text-[#7d6f6b] hover:text-red-400 hover:bg-[#140f0e] transition-colors"
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

      {/* MODAL NUEVA SESIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2d2220] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#a55850]" />
                <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
                  Publicar Nueva Sesión
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#7d6f6b] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Título de la Sesión *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Reseteo Profundo de la Ansiedad y Calma Interior"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Descripción Emocional / Propósito *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica qué sensaciones o problemas aborda la sesión..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a89b97] font-medium mb-1.5">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#a89b97] font-medium mb-1.5">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Terapeuta o Guía
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none"
                />
              </div>

              {/* Subida de Archivos Simulados */}
              <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-3">
                <span className="text-[#b98d76] font-medium block flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Archivos Multimedia (Simulación de Carga)
                </span>

                <div className="space-y-1">
                  <label className="text-[#7d6f6b] block">Subir Archivo de Audio (MP3 / WAV):</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleSimulatedFileUpload(e, 'media')}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#a55850] file:text-white hover:file:bg-[#b8665d] cursor-pointer"
                  />
                  {mediaUrl && (
                    <span className="text-[11px] text-teal-400 block truncate mt-1">
                      ✓ Archivo cargado correctamente
                    </span>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-[#2d2220]">
                  <label className="text-[#7d6f6b] block">Subir Imagen de Portada:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSimulatedFileUpload(e, 'cover')}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#a55850] file:text-white hover:file:bg-[#b8665d] cursor-pointer"
                  />
                  {coverUrl && (
                    <span className="text-[11px] text-teal-400 block truncate mt-1">
                      ✓ Imagen de portada asignada
                    </span>
                  )}
                </div>
              </div>

              {/* Switch Destacado */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#a55850] bg-[#140f0e] border-[#2d2220]"
                />
                <label htmlFor="isFeatured" className="text-[#ece5e2] font-medium cursor-pointer">
                  Marcar como sesión destacada (aparecerá en el carrusel principal)
                </label>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2220]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-full bg-[#140f0e] text-[#a89b97] hover:text-[#ece5e2] border border-[#2d2220]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-xs shadow-lg shadow-[#a55850]/20 disabled:opacity-50"
                >
                  {uploading ? 'Procesando...' : 'Guardar y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
