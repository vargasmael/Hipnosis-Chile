'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { normalizeFirestoreSesion } from '@/lib/services/contentService';
import {
  Film,
  Plus,
  Trash2,
  Pencil,
  Upload,
  CheckCircle2,
  Star,
  Sparkles,
  Clock,
  Search,
  X,
  Headphones,
} from 'lucide-react';
import { Sesion, Categoria } from '@/types/database';

export default function AdminSesionesPage() {
  const [sessions, setSessions] = useState<Sesion[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modal nueva sesión
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [author, setAuthor] = useState('Dra. Valentina Montes');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal edición de sesión existente
  const [editingSession, setEditingSession] = useState<Sesion | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDurationMinutes, setEditDurationMinutes] = useState(15);
  const [editDurationSeconds, setEditDurationSeconds] = useState(0);
  const [editAuthor, setEditAuthor] = useState('Dra. Valentina Montes');
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editCoverImageFile, setEditCoverImageFile] = useState<File | null>(null);
  const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
  const [editExistingImageUrl, setEditExistingImageUrl] = useState('');
  const [editExistingAudioUrl, setEditExistingAudioUrl] = useState('');

  // Función de subida a Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Configuración de Cloudinary incompleta (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME o NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Error al subir archivo a Cloudinary');
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Cloudinary no devolvió la propiedad secure_url');
    }

    return data.secure_url;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetching de Categorías de Firestore con try/catch
      let catList: Categoria[] = [];
      try {
        const catSnap = await getDocs(collection(db, 'categorias'));
        catSnap.forEach((d) => {
          const data = d.data();
          catList.push({
            id: d.id,
            nombre: data.nombre || '',
            slug: data.slug || data.nombre?.toLowerCase().replace(/\s+/g, '-') || d.id,
            descripcion: data.descripcion || '',
            orden: Number(data.orden) || 0,
          });
        });
      } catch (catErr) {
        console.warn('Error fetching categorias en Firestore:', catErr);
      }

      // Si aún no hay categorías creadas en Firestore, proveer categorías estándar
      if (catList.length === 0) {
        catList = [
          { id: 'ansiedad-estres', nombre: 'Alivio de Ansiedad y Estrés', slug: 'ansiedad-estres', orden: 1 },
          { id: 'sueno-profundo', nombre: 'Sueño Profundo e Insomnio', slug: 'sueno-profundo', orden: 2 },
          { id: 'autoestima-confianza', nombre: 'Autoestima y Confianza', slug: 'autoestima-confianza', orden: 3 },
          { id: 'desbloqueo-emocional', nombre: 'Desbloqueo Emocional', slug: 'desbloqueo-emocional', orden: 4 },
          { id: 'sanacion-interior', nombre: 'Sanación Interior', slug: 'sanacion-interior', orden: 5 },
        ];
      }

      catList.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      setCategories(catList);
      if (!categoryId && catList.length > 0) {
        setCategoryId(catList[0].id);
      }

      // 2. Fetching real de Sesiones de Firestore: collection(db, 'sesiones') con try/catch
      const sessSnap = await getDocs(collection(db, 'sesiones'));
      const sessList: Sesion[] = [];
      sessSnap.forEach((d) => {
        sessList.push(normalizeFirestoreSesion(d.id, d.data()));
      });

      // Asignar objeto categoría si existe
      sessList.forEach((s) => {
        if (!s.categoria && s.categoria_id) {
          s.categoria = catList.find((c) => c.id === s.categoria_id);
        }
      });

      setSessions(sessList);
    } catch (err) {
      console.warn('Error fetching sesiones de Firestore:', err);
      setSessions([]);
      showToast('Nota: No se encontraron sesiones o la base de datos está vacía.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar que ambos archivos estén seleccionados
    if (!coverImageFile) {
      showToast('Por favor selecciona una imagen de portada');
      return;
    }
    if (!audioFile) {
      showToast('Por favor selecciona un archivo de audio');
      return;
    }

    const totalSeconds = (Number(durationMinutes) || 0) * 60 + (Number(durationSeconds) || 0);
    if (totalSeconds <= 0) {
      showToast('La duración debe ser mayor a 0 segundos');
      return;
    }

    setUploading(true);

    try {
      // 2. Sube primero la imagen a Cloudinary y obtén su URL
      const imageUrl = await uploadToCloudinary(coverImageFile);

      // 3. Sube luego el audio a Cloudinary y obtén su URL
      const audioUrl = await uploadToCloudinary(audioFile);

      const selectedCat = categories.find((c) => c.id === categoryId);

      const newRecord = {
        titulo: title.trim(),
        title: title.trim(),
        descripcion: description.trim(),
        description: description.trim(),
        categoria_id: categoryId || (categories[0]?.id ?? 'ansiedad-estres'),
        id_categoria: categoryId || (categories[0]?.id ?? 'ansiedad-estres'),
        categoria: selectedCat ? selectedCat : undefined,
        duracion: totalSeconds,
        duration: totalSeconds,
        audio_url: audioUrl,
        url_archivo_multimedia: audioUrl,
        imagen_url: imageUrl,
        url_imagen_portada: imageUrl,
        destacado: Boolean(isFeatured),
        guia_o_autor: author.trim() || 'Dra. Valentina Montes',
        tipo_multimedia: 'audio' as const,
        veces_reproducida: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 4. addDoc en Firestore
      const docRef = await addDoc(collection(db, 'sesiones'), newRecord);

      showToast('Nueva sesión y archivos guardados con éxito');
      const createdSession: Sesion = {
        ...newRecord,
        id: docRef.id,
      };
      setSessions((prev) => [createdSession, ...prev]);
      setShowModal(false);

      // Reset fields
      setTitle('');
      setDescription('');
      setCoverImageFile(null);
      setAudioFile(null);
      setIsFeatured(false);
      setDurationMinutes(15);
      setDurationSeconds(0);
    } catch (err: any) {
      console.error('Error al subir archivos o crear sesión:', err);
      showToast(err?.message || 'Error al procesar la subida a Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = (session: Sesion) => {
    setEditingSession(session);
    setEditTitle(session.titulo || session.title || '');
    setEditDescription(session.descripcion || session.description || '');
    setEditCategoryId(session.categoria_id || session.id_categoria || (categories[0]?.id ?? ''));

    const totalSecs = Number(session.duracion) || 0;
    setEditDurationMinutes(Math.floor(totalSecs / 60));
    setEditDurationSeconds(totalSecs % 60);

    setEditAuthor(session.guia_o_autor || 'Dra. Valentina Montes');
    setEditIsFeatured(Boolean(session.destacado));
    setEditExistingImageUrl(session.imagen_url || session.url_imagen_portada || '');
    setEditExistingAudioUrl(session.audio_url || session.url_archivo_multimedia || '');
    setEditCoverImageFile(null);
    setEditAudioFile(null);
    setShowEditModal(true);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    if (!editTitle.trim()) {
      showToast('El título no puede estar vacío');
      return;
    }

    const totalSeconds = (Number(editDurationMinutes) || 0) * 60 + (Number(editDurationSeconds) || 0);
    if (totalSeconds <= 0) {
      showToast('La duración debe ser mayor a 0 segundos');
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = editExistingImageUrl;
      let finalAudioUrl = editExistingAudioUrl;

      // Subir nueva portada si fue seleccionada
      if (editCoverImageFile) {
        finalImageUrl = await uploadToCloudinary(editCoverImageFile);
      }

      // Subir nuevo audio si fue seleccionado
      if (editAudioFile) {
        finalAudioUrl = await uploadToCloudinary(editAudioFile);
      }

      const selectedCat = categories.find((c) => c.id === editCategoryId);

      const updatedRecord = {
        titulo: editTitle.trim(),
        title: editTitle.trim(),
        descripcion: editDescription.trim(),
        description: editDescription.trim(),
        categoria_id: editCategoryId || (categories[0]?.id ?? 'ansiedad-estres'),
        id_categoria: editCategoryId || (categories[0]?.id ?? 'ansiedad-estres'),
        categoria: selectedCat ? selectedCat : undefined,
        duracion: totalSeconds,
        duration: totalSeconds,
        audio_url: finalAudioUrl,
        url_archivo_multimedia: finalAudioUrl,
        imagen_url: finalImageUrl,
        url_imagen_portada: finalImageUrl,
        destacado: Boolean(editIsFeatured),
        guia_o_autor: editAuthor.trim() || 'Dra. Valentina Montes',
        updated_at: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'sesiones', editingSession.id), updatedRecord);

      // Actualizar estado local
      setSessions((prev) =>
        prev.map((s) => (s.id === editingSession.id ? { ...s, ...updatedRecord } : s))
      );

      showToast('Sesión y duración actualizadas con éxito en Firestore');
      setShowEditModal(false);
      setEditingSession(null);
    } catch (err: any) {
      console.error('Error al actualizar sesión en Firestore:', err);
      showToast(err?.message || 'Error al actualizar sesión en Firestore');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sesión de Firestore?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'sesiones', id));
      setSessions((prev) => prev.filter((s) => s.id !== id));
      showToast('Sesión eliminada de Firestore');
    } catch (err: any) {
      showToast('Error al eliminar sesión en Firestore');
    }
  };

  const handleToggleFeatured = async (session: Sesion) => {
    const nextState = !session.destacado;
    try {
      await updateDoc(doc(db, 'sesiones', session.id), { destacado: nextState });
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, destacado: nextState } : s))
      );
      showToast('Estado destacado actualizado en Firestore');
    } catch {
      showToast('Error al actualizar estado en Firestore');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchCategory = selectedCategoryFilter
      ? s.categoria_id === selectedCategoryFilter || s.id_categoria === selectedCategoryFilter
      : true;
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
            Gestión de Sesiones (Firestore)
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
            Crea, edita, corrige duraciones y organiza las inducciones guiadas directamente en Firestore.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-lg shadow-[#a55850]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
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
            placeholder="Buscar sesión por título o autor..."
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

      {/* Tabla de Sesiones o Estado Vacío */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a89b97] bg-[#1e1716] rounded-3xl border border-[#2d2220] animate-pulse">
          Consultando sesiones en Firestore...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
          <Headphones className="w-12 h-12 mx-auto text-[#b98d76] opacity-60" />
          <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
            No hay sesiones disponibles aún
          </h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light leading-relaxed">
            Aún no se han registrado audios en la colección `sesiones` de Firestore o no coinciden con tu búsqueda. Haz clic en &quot;Nueva Sesión&quot; para crear la primera.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] text-white text-xs font-medium shadow-md shadow-[#a55850]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Crear Primera Sesión
          </button>
        </div>
      ) : (
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
                        src={session.imagen_url || session.url_imagen_portada || ''}
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
                        <span className="font-medium">
                          {Math.floor(session.duracion / 60)} min
                          {session.duracion % 60 > 0 ? ` ${session.duracion % 60}s` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleFeatured(session)}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(session)}
                          className="p-2 rounded-xl text-[#b98d76] hover:text-[#fbf7f4] hover:bg-[#251d1c] transition-colors cursor-pointer"
                          title="Editar sesión y corregir tiempo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 rounded-xl text-[#7d6f6b] hover:text-red-400 hover:bg-[#140f0e] transition-colors cursor-pointer"
                          title="Eliminar sesión de Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NUEVA SESIÓN CON GUARDADO EN FIRESTORE (addDoc) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2d2220] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#a55850]" />
                <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
                  Publicar Nueva Sesión en Firestore
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!uploading) setShowModal(false);
                }}
                disabled={uploading}
                className="p-1 text-[#7d6f6b] hover:text-white rounded-lg disabled:opacity-40"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
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
                    Duración (Minutos y Segundos) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        required
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850] pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#7d6f6b]">min</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={durationSeconds}
                        onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850] pr-8"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#7d6f6b]">seg</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#7d6f6b] mt-1 block">
                    Total: {(Number(durationMinutes) || 0) * 60 + (Number(durationSeconds) || 0)} segundos
                  </span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              {/* Inputs de Archivo Cloudinary */}
              <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-4">
                <span className="text-[#b98d76] font-medium flex items-center gap-1.5 text-xs">
                  <Upload className="w-4 h-4 text-[#a55850]" /> Archivos Multimedia (Cloudinary CDN)
                </span>

                <div className="space-y-1.5">
                  <label className="text-[#a89b97] block font-medium">
                    Imagen de Portada *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2d2220] file:text-[#fbf7f4] hover:file:bg-[#3b2c29] cursor-pointer"
                  />
                  {coverImageFile ? (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ Imagen seleccionada: {coverImageFile.name} ({(coverImageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#7d6f6b] block">
                      Selecciona una imagen (JPG, PNG, WebP) para la portada de la sesión.
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#2d2220]">
                  <label className="text-[#a89b97] block font-medium">
                    Archivo de Audio (MP3 / WAV) *
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2d2220] file:text-[#fbf7f4] hover:file:bg-[#3b2c29] cursor-pointer"
                  />
                  {audioFile ? (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ Audio seleccionado: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#7d6f6b] block">
                      Selecciona el archivo de relajación o hipnosis guiada.
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
                  Marcar como sesión destacada en el carrusel de inicio
                </label>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2220]">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setShowModal(false);
                    setCoverImageFile(null);
                    setAudioFile(null);
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#140f0e] text-[#a89b97] hover:text-[#ece5e2] border border-[#2d2220] disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-xs shadow-lg shadow-[#a55850]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>Subiendo archivos y procesando... por favor espera</span>
                    </>
                  ) : (
                    'Guardar en Firestore'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR SESIÓN EN FIRESTORE (updateDoc) */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2d2220] pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#a55850]" />
                <div>
                  <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
                    Editar Sesión
                  </h3>
                  <p className="text-[10px] text-[#7d6f6b] font-mono mt-0.5">
                    ID: {editingSession.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!uploading) {
                    setShowEditModal(false);
                    setEditingSession(null);
                  }
                }}
                disabled={uploading}
                className="p-1 text-[#7d6f6b] hover:text-white rounded-lg disabled:opacity-40 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Título de la Sesión *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Explica qué sensaciones o problemas aborda la sesión..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a89b97] font-medium mb-1.5">Categoría</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
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
                    Duración exacta (Minutos y Segundos) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        required
                        value={editDurationMinutes}
                        onChange={(e) => setEditDurationMinutes(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850] pr-9 font-medium"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#7d6f6b]">min</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={editDurationSeconds}
                        onChange={(e) => setEditDurationSeconds(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850] pr-9 font-medium"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#7d6f6b]">seg</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#b98d76] mt-1 bg-[#140f0e] px-2.5 py-1 rounded-lg border border-[#2d2220]">
                    <span>Total a guardar:</span>
                    <span className="font-semibold text-[#fbf7f4]">
                      {editDurationMinutes}m {editDurationSeconds}s ({((Number(editDurationMinutes) || 0) * 60) + (Number(editDurationSeconds) || 0)} s)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Terapeuta o Guía
                </label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              {/* Multimedia (Cloudinary CDN o URLs actuales) */}
              <div className="p-4 rounded-2xl bg-[#140f0e] border border-[#2d2220] space-y-4">
                <span className="text-[#b98d76] font-medium flex items-center gap-1.5 text-xs">
                  <Upload className="w-4 h-4 text-[#a55850]" /> Archivos Multimedia (Opcional - solo si deseas cambiarlos)
                </span>

                {/* Imagen de portada */}
                <div className="space-y-2">
                  <label className="text-[#a89b97] block font-medium">
                    Imagen de Portada
                  </label>
                  {editExistingImageUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#1e1716] border border-[#2d2220]">
                      <img
                        src={editExistingImageUrl}
                        alt="Portada actual"
                        className="w-12 h-12 rounded-lg object-cover bg-[#140f0e] border border-[#3b2c29]"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-[#ece5e2] block truncate font-medium">
                          Portada actual guardada
                        </span>
                        <span className="text-[10px] text-[#7d6f6b] block truncate font-mono">
                          {editExistingImageUrl}
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditCoverImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-[#2d2220] file:text-[#fbf7f4] hover:file:bg-[#3b2c29] cursor-pointer"
                  />
                  {editCoverImageFile ? (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ Nueva portada seleccionada: {editCoverImageFile.name} ({(editCoverImageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#7d6f6b] block">
                      Deja este campo vacío si deseas conservar la portada actual.
                    </span>
                  )}
                </div>

                {/* Archivo de audio */}
                <div className="space-y-2 pt-2 border-t border-[#2d2220]">
                  <label className="text-[#a89b97] block font-medium">
                    Archivo de Audio (MP3 / WAV)
                  </label>
                  {editExistingAudioUrl && (
                    <div className="p-2.5 rounded-xl bg-[#1e1716] border border-[#2d2220] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#ece5e2] font-medium">Audio actual vinculado</span>
                        <a
                          href={editExistingAudioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#b98d76] hover:text-white transition-colors"
                        >
                          Escuchar en pestaña nueva ↗
                        </a>
                      </div>
                      <audio
                        controls
                        src={editExistingAudioUrl}
                        className="w-full h-8 opacity-80"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setEditAudioFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#a89b97] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-[#2d2220] file:text-[#fbf7f4] hover:file:bg-[#3b2c29] cursor-pointer"
                  />
                  {editAudioFile ? (
                    <span className="text-[11px] text-teal-400 block truncate">
                      ✓ Nuevo audio seleccionado: {editAudioFile.name} ({(editAudioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#7d6f6b] block">
                      Deja este campo vacío si deseas conservar el archivo de audio actual.
                    </span>
                  )}
                </div>
              </div>

              {/* Switch Destacado */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#a55850] bg-[#140f0e] border-[#2d2220]"
                />
                <label htmlFor="editIsFeatured" className="text-[#ece5e2] font-medium cursor-pointer">
                  Marcar como sesión destacada en el carrusel de inicio
                </label>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d2220]">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#140f0e] text-[#a89b97] hover:text-[#ece5e2] border border-[#2d2220] disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium text-xs shadow-lg shadow-[#a55850]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      <span>Actualizando sesión en Firestore...</span>
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
