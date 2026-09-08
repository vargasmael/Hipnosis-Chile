import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  setDoc,
} from 'firebase/firestore';
import { Categoria, Sesion } from '@/types/database';

/**
 * Normaliza un documento proveniente de Firestore con soporte para campos en español e inglés
 */
export function normalizeFirestoreSesion(id: string, data: any): Sesion {
  if (!data) {
    return {
      id,
      titulo: 'Sesión sin título',
      title: 'Sesión sin título',
      descripcion: '',
      description: '',
      id_categoria: '',
      duracion: 600,
      url_archivo_multimedia: '',
      destacado: false,
      guia_o_autor: 'Especialista Re-Programa',
      created_at: new Date().toISOString(),
    };
  }

  // Soporte universal para variaciones de clave de título en Firestore
  const rawTitle =
    data.titulo ??
    data.title ??
    data.nombre ??
    data.name ??
    data.Titulo ??
    data.Title ??
    data.titulo_sesion ??
    data.nombre_sesion ??
    '';

  const resolvedTitle = String(rawTitle).trim() || 'Sesión sin título';

  // Log de diagnóstico temporal para depuración en producción
  console.log(`[contentService] Mapeando sesión ${id}:`, {
    resolvedTitle,
    dataKeys: Object.keys(data),
    dataTitulo: data.titulo,
    dataTitle: data.title,
    dataNombre: data.nombre,
  });

  const rawDesc =
    data.descripcion ??
    data.description ??
    data.desc ??
    data.Descripcion ??
    '';

  const audioUrl =
    data.audio_url ||
    data.audioUrl ||
    data.url_archivo_multimedia ||
    data.media_url ||
    data.mediaUrl ||
    data.url ||
    '';

  const imageUrl =
    data.imagen_url ||
    data.imagenUrl ||
    data.url_imagen_portada ||
    data.cover_url ||
    data.coverUrl ||
    data.imageUrl ||
    null;

  const rawDuration =
    Number(data.duracion) ||
    Number(data.duration) ||
    Number(data.duracion_segundos) ||
    600;

  const author =
    data.guia_o_autor ||
    data.autor ||
    data.author ||
    data.guia ||
    'Especialista Re-Programa';

  const catId = data.categoria_id || data.id_categoria || data.categoryId || '';

  return {
    id,
    titulo: resolvedTitle,
    title: resolvedTitle,
    descripcion: String(rawDesc),
    description: String(rawDesc),
    id_categoria: catId,
    categoria_id: catId,
    categoria: data.categoria || undefined,
    duracion: rawDuration,
    audio_url: audioUrl,
    imagen_url: imageUrl,
    url_archivo_multimedia: audioUrl,
    url_imagen_portada: imageUrl,
    tipo_multimedia: data.tipo_multimedia || 'audio',
    destacado: Boolean(data.destacado || data.featured),
    guia_o_autor: author,
    veces_reproducida: Number(data.veces_reproducida || data.plays) || 0,
    tags: data.tags || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
  };
}

/**
 * Obtener categorías desde la colección 'categorias' de Firestore
 */
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const colRef = collection(db, 'categorias');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return [];
    }

    const categories: Categoria[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      categories.push({
        id: d.id,
        nombre: data.nombre || '',
        slug: data.slug || data.nombre?.toLowerCase().replace(/\s+/g, '-') || d.id,
        descripcion: data.descripcion || '',
        orden: Number(data.orden) || 0,
        icono: data.icono || null,
        created_at: data.created_at,
      });
    });

    return categories.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  } catch (err) {
    console.warn('Error al obtener categorías de Firestore:', err);
    return [];
  }
}

/**
 * Obtener sesiones desde la colección 'sesiones' de Firestore
 */
export async function getSesiones(options?: {
  categoriaId?: string;
  destacadas?: boolean;
  busqueda?: string;
  duracionMaxMinutos?: number;
}): Promise<Sesion[]> {
  try {
    const colRef = collection(db, 'sesiones');
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return [];
    }

    let sessions: Sesion[] = [];
    snapshot.forEach((d) => {
      sessions.push(normalizeFirestoreSesion(d.id, d.data()));
    });

    if (options?.categoriaId) {
      sessions = sessions.filter(
        (s) => s.categoria_id === options.categoriaId || s.id_categoria === options.categoriaId
      );
    }

    if (options?.destacadas) {
      sessions = sessions.filter((s) => s.destacado);
    }

    if (options?.busqueda) {
      const q = options.busqueda.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.titulo.toLowerCase().includes(q) ||
          s.descripcion.toLowerCase().includes(q) ||
          s.guia_o_autor.toLowerCase().includes(q)
      );
    }

    if (options?.duracionMaxMinutos) {
      sessions = sessions.filter((s) => s.duracion <= options.duracionMaxMinutos! * 60);
    }

    return sessions;
  } catch (err) {
    console.warn('Error al obtener sesiones de Firestore:', err);
    return [];
  }
}

/**
 * Crear nueva sesión en la colección 'sesiones' de Firestore
 */
export async function createSesion(sessionData: Omit<Sesion, 'id'>): Promise<string> {
  const colRef = collection(db, 'sesiones');
  const docRef = await addDoc(colRef, {
    ...sessionData,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Eliminar sesión de Firestore
 */
export async function deleteSesion(id: string): Promise<void> {
  const docRef = doc(db, 'sesiones', id);
  await deleteDoc(docRef);
}

/**
 * Alternar estado destacado de una sesión en Firestore
 */
export async function toggleSesionDestacado(id: string, currentState: boolean): Promise<boolean> {
  const docRef = doc(db, 'sesiones', id);
  const nextState = !currentState;
  await updateDoc(docRef, { destacado: nextState });
  return nextState;
}

/**
 * Guarda o actualiza progreso en Firestore (colección 'progreso_favoritos')
 */
export async function saveProgreso(
  userId: string,
  sesionId: string,
  tiempoSegundos: number,
  completado: boolean = false
): Promise<void> {
  if (!userId || !sesionId) return;
  try {
    const docKey = `${userId}_${sesionId}`;
    const docRef = doc(db, 'progreso_favoritos', docKey);
    await setDoc(
      docRef,
      {
        id_usuario: userId,
        id_sesion: sesionId,
        tiempo_reproduccion: Math.floor(tiempoSegundos),
        completado,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Error al guardar progreso en Firestore:', err);
  }
}

/**
 * Alternar favorito en Firestore y localStorage
 */
export async function toggleFavorito(
  userId: string,
  sesionId: string,
  nuevoEstado: boolean
): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('reprograma_favoritos_ids');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (nuevoEstado) {
        if (!ids.includes(sesionId)) ids.push(sesionId);
      } else {
        ids = ids.filter((id) => id !== sesionId);
      }
      localStorage.setItem('reprograma_favoritos_ids', JSON.stringify(ids));
      window.dispatchEvent(new Event('reprograma_favoritos_updated'));
    } catch {
      // ignore
    }
  }

  if (!userId || !sesionId) return nuevoEstado;

  try {
    const docKey = `${userId}_${sesionId}`;
    const docRef = doc(db, 'progreso_favoritos', docKey);
    await setDoc(
      docRef,
      {
        id_usuario: userId,
        id_sesion: sesionId,
        es_favorito: nuevoEstado,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
    return !nuevoEstado;
  } catch {
    return nuevoEstado;
  }
}

/**
 * Obtener favoritos del usuario
 */
export async function getFavoritos(userId?: string): Promise<Sesion[]> {
  try {
    let favoriteIds: string[] = [];

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reprograma_favoritos_ids');
      if (saved) {
        favoriteIds = JSON.parse(saved);
      }
    }

    if (userId) {
      try {
        const colRef = collection(db, 'progreso_favoritos');
        const q = query(colRef, where('id_usuario', '==', userId), where('es_favorito', '==', true));
        const snap = await getDocs(q);
        if (!snap.empty) {
          favoriteIds = snap.docs.map((d) => d.data().id_sesion);
        }
      } catch {
        // continue
      }
    }

    if (favoriteIds.length === 0) {
      return [];
    }

    const allSessions = await getSesiones();
    return allSessions.filter((s) => favoriteIds.includes(s.id));
  } catch {
    return [];
  }
}
