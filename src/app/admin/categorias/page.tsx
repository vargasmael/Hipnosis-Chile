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
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Categoria } from '@/types/database';

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categorias'));
      const list: Categoria[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          nombre: data.nombre || '',
          slug: data.slug || data.nombre?.toLowerCase().replace(/\s+/g, '-') || d.id,
          descripcion: data.descripcion || '',
          orden: Number(data.orden) || 0,
        });
      });
      list.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      setCategories(list);
    } catch (err) {
      console.warn('Error al cargar categorías de Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCategory(cat);
    setName(cat.nombre);
    setDescription(cat.descripcion || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categorias', editingCategory.id), {
          nombre: name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          descripcion: description,
        });
        showToast('Categoría actualizada con éxito en Firestore');
      } else {
        await addDoc(collection(db, 'categorias'), {
          nombre: name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          descripcion: description,
          orden: categories.length + 1,
          created_at: new Date().toISOString(),
        });
        showToast('Categoría creada exitosamente en Firestore');
      }
      await fetchCategorias();
      setShowModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Error al guardar categoría');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categorias', id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Categoría eliminada de Firestore');
    } catch (err: any) {
      showToast('Error al eliminar categoría');
    }
  };

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
            <FolderTree className="w-3.5 h-3.5 text-[#a55850]" />
            <span>Taxonomía de Contenidos (Firestore)</span>
          </div>
          <h1 className="font-serif-persona text-2xl sm:text-4xl font-normal text-[#fbf7f4] tracking-tight">
            Categorías Terapéuticas
          </h1>
          <p className="text-xs sm:text-sm text-[#a89b97] mt-1 font-light">
            Organiza las temáticas de sanación conectando directamente con Firestore.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white text-xs font-medium tracking-wide shadow-lg shadow-[#a55850]/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid de Categorías */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a89b97] bg-[#1e1716] rounded-3xl border border-[#2d2220] animate-pulse">
          Consultando categorías en Firestore...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#1e1716] border border-[#2d2220] p-8 space-y-3">
          <FolderTree className="w-12 h-12 mx-auto text-[#b98d76] opacity-60" />
          <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
            No hay categorías registradas aún
          </h3>
          <p className="text-xs sm:text-sm text-[#a89b97] max-w-sm mx-auto font-light leading-relaxed">
            Crea la primera categoría en Firestore para organizar las inducciones guiadas.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#a55850] text-white text-xs font-medium shadow"
          >
            <Plus className="w-4 h-4" /> Crear Categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-[#1e1716] border border-[#3b2c29] hover:border-[#a55850]/40 transition-all shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-[#b98d76] bg-[#140f0e] px-2.5 py-1 rounded-full border border-[#2d2220]">
                    Posición #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-[#7d6f6b] hover:text-[#ece5e2] hover:bg-[#140f0e] rounded-lg transition-colors"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-[#7d6f6b] hover:text-red-400 hover:bg-[#140f0e] rounded-lg transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif-persona text-lg text-[#fbf7f4] font-normal">
                  {cat.nombre}
                </h3>
                <p className="text-xs text-[#a89b97] mt-1.5 font-light leading-relaxed">
                  {cat.descripcion || 'Sin descripción asignada.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#2d2220] flex items-center justify-between text-[11px] text-[#7d6f6b]">
                <span>Slug: /{cat.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Categoría */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#1e1716] border border-[#3b2c29] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2d2220] pb-3">
              <h3 className="font-serif-persona text-xl text-[#fbf7f4]">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#7d6f6b] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sanación del Duelo & Pérdida"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              <div>
                <label className="block text-[#a89b97] font-medium mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica qué tipo de sesiones agrupa esta categoría..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#140f0e] border border-[#2d2220] text-[#ece5e2] focus:outline-none focus:border-[#a55850]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2220]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full bg-[#140f0e] text-[#a89b97] hover:text-white border border-[#2d2220]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#a55850] hover:bg-[#b8665d] text-white font-medium shadow-md shadow-[#a55850]/20"
                >
                  {editingCategory ? 'Actualizar' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
