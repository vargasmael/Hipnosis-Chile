import { supabase } from '@/lib/supabaseClient';
import { Categoria, Sesion, ProgresoFavorito } from '@/types/database';

/**
 * Normaliza un objeto de sesión proveniente de Supabase
 * (Soporta tanto el esquema nuevo: audio_url, imagen_url, categoria_id
 * como el esquema anterior: url_archivo_multimedia, url_imagen_portada, id_categoria)
 */
export function normalizeSesion(data: any): Sesion {
  return {
    id: data.id,
    titulo: data.titulo || 'Sesión sin título',
    descripcion: data.descripcion || '',
    id_categoria: data.categoria_id || data.id_categoria || '',
    categoria_id: data.categoria_id || data.id_categoria || '',
    categoria: data.categoria || undefined,
    duracion: Number(data.duracion) || 600,
    audio_url: data.audio_url || data.url_archivo_multimedia || '',
    imagen_url: data.imagen_url || data.url_imagen_portada || null,
    url_archivo_multimedia: data.audio_url || data.url_archivo_multimedia || '',
    url_imagen_portada: data.imagen_url || data.url_imagen_portada || null,
    tipo_multimedia: data.tipo_multimedia || 'audio',
    destacado: Boolean(data.destacado),
    guia_o_autor: data.guia_o_autor || 'Especialista Re-Programa',
    veces_reproducida: Number(data.veces_reproducida) || 0,
    tags: data.tags || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
  };
}

/**
 * Servicio para obtener categorías reales desde Supabase
 */
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true });

    if (error || !data) {
      console.warn('No se pudieron obtener categorías de Supabase:', error?.message);
      return [];
    }

    return data.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug || c.nombre.toLowerCase().replace(/\s+/g, '-'),
      descripcion: c.descripcion,
      orden: c.orden ?? 0,
      icono: c.icono,
      created_at: c.created_at,
    }));
  } catch (err) {
    console.warn('Error en getCategorias:', err);
    return [];
  }
}

/**
 * Servicio para obtener sesiones reales desde Supabase
 */
export async function getSesiones(options?: {
  categoriaId?: string;
  destacadas?: boolean;
  busqueda?: string;
  duracionMaxMinutos?: number;
}): Promise<Sesion[]> {
  try {
    let query = supabase.from('sesiones').select('*, categoria:categorias(*)');

    if (options?.categoriaId) {
      query = query.or(`categoria_id.eq.${options.categoriaId},id_categoria.eq.${options.categoriaId}`);
    }
    if (options?.destacadas) {
      query = query.eq('destacado', true);
    }
    if (options?.busqueda) {
      query = query.ilike('titulo', `%${options.busqueda}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('No se pudieron obtener sesiones de Supabase:', error?.message);
      return [];
    }

    let sessions = data.map(normalizeSesion);

    if (options?.duracionMaxMinutos) {
      sessions = sessions.filter((s) => s.duracion <= options.duracionMaxMinutos! * 60);
    }

    return sessions;
  } catch (err) {
    console.warn('Error en getSesiones:', err);
    return [];
  }
}

/**
 * Guarda o actualiza el progreso de reproducción en Supabase
 */
export async function saveProgreso(
  userId: string,
  sesionId: string,
  tiempoSegundos: number,
  completado: boolean = false
): Promise<void> {
  if (!userId || !sesionId) return;

  try {
    await supabase.from('progreso_favoritos').upsert(
      {
        id_usuario: userId,
        id_sesion: sesionId,
        tiempo_reproduccion: Math.floor(tiempoSegundos),
        completado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id_usuario,id_sesion' }
    );
  } catch (err) {
    console.warn('Progreso guardado localmente (Supabase no accesible):', err);
  }
}

/**
 * Marca o desmarca una sesión como favorita
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
    const { error } = await supabase.from('progreso_favoritos').upsert(
      {
        id_usuario: userId,
        id_sesion: sesionId,
        es_favorito: nuevoEstado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id_usuario,id_sesion' }
    );
    return !error;
  } catch {
    return nuevoEstado;
  }
}

/**
 * Obtiene la lista de sesiones favoritas del usuario
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
        const { data } = await supabase
          .from('progreso_favoritos')
          .select('id_sesion')
          .eq('id_usuario', userId)
          .eq('es_favorito', true);

        if (data && data.length > 0) {
          favoriteIds = data.map((d: any) => d.id_sesion);
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
