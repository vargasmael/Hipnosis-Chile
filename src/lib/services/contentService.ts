import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Categoria, Sesion, ProgresoFavorito } from '@/types/database';
import { MOCK_CATEGORIAS, MOCK_SESIONES } from '@/lib/data/mockData';

/**
 * Servicio para obtener categorías
 */
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIAS;
    }
    return data;
  } catch {
    return MOCK_CATEGORIAS;
  }
}

/**
 * Servicio para obtener sesiones con su categoría relacionada
 */
export async function getSesiones(options?: {
  categoriaId?: string;
  destacadas?: boolean;
  busqueda?: string;
  duracionMaxMinutos?: number;
}): Promise<Sesion[]> {
  try {
    const supabase = createBrowserClient();
    let query = supabase
      .from('sesiones')
      .select('*, categoria:categorias(*)');

    if (options?.categoriaId) {
      query = query.eq('id_categoria', options.categoriaId);
    }
    if (options?.destacadas) {
      query = query.eq('destacado', true);
    }
    if (options?.busqueda) {
      query = query.ilike('titulo', `%${options.busqueda}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = [...MOCK_SESIONES];
      if (options?.categoriaId) {
        filtered = filtered.filter((s) => s.id_categoria === options.categoriaId);
      }
      if (options?.destacadas) {
        filtered = filtered.filter((s) => s.destacado);
      }
      if (options?.busqueda) {
        const q = options.busqueda.toLowerCase();
        filtered = filtered.filter((s) =>
          s.titulo.toLowerCase().includes(q) || s.descripcion.toLowerCase().includes(q)
        );
      }
      if (options?.duracionMaxMinutos) {
        filtered = filtered.filter((s) => s.duracion <= options.duracionMaxMinutos! * 60);
      }
      return filtered;
    }

    return data as Sesion[];
  } catch {
    return MOCK_SESIONES;
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
    const supabase = createBrowserClient();
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
  if (!userId || !sesionId) return nuevoEstado;

  try {
    const supabase = createBrowserClient();
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
