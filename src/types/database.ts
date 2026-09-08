export type EstadoSuscripcion = 'activa' | 'inactiva' | 'pendiente' | 'cancelada' | 'activo';
export type RolUsuario = 'user' | 'admin';
export type TipoMultimedia = 'audio' | 'video';

/**
 * Validador unificado de estado de suscripción que acepta 'activa', 'activo' o 'active'
 */
export function isSubscriptionActive(estado?: string | null): boolean {
  if (!estado) return false;
  const s = String(estado).toLowerCase().trim();
  return s === 'activa' || s === 'activo' || s === 'active';
}

export interface Usuario {
  id: string;
  email: string;
  nombre_completo?: string | null;
  estado_suscripcion: EstadoSuscripcion;
  id_suscripcion_mercadopago?: string | null;
  rol: RolUsuario;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  orden?: number;
  icono?: string | null;
  created_at?: string;
}

export interface Sesion {
  id: string;
  titulo: string;
  title?: string; // Compatibilidad con campos en inglés
  descripcion: string;
  description?: string; // Compatibilidad con campos en inglés
  id_categoria: string;
  categoria?: Categoria;
  duracion: number; // en segundos
  url_archivo_multimedia: string;
  url_imagen_portada?: string | null;
  // Propiedades canónicas del esquema Supabase/Firestore:
  categoria_id?: string;
  audio_url?: string;
  imagen_url?: string | null;
  tipo_multimedia?: TipoMultimedia;
  destacado: boolean;
  guia_o_autor: string;
  veces_reproducida?: number;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ProgresoFavorito {
  id_usuario: string;
  id_sesion: string;
  tiempo_reproduccion: number; // segundos
  completado: boolean;
  es_favorito: boolean;
  updated_at: string;
  sesion?: Sesion;
}
