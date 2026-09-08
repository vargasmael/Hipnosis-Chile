-- ==============================================================================
-- RE-PROGRAMA / HIPNOSIS CHILE - SUPABASE SCHEMA (FASE 5)
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu panel de control de Supabase.
-- Incluye: Tablas requeridas (profiles, categorias, sesiones), claves foráneas,
-- Row Level Security (RLS), políticas de acceso y trigger de sincronización de usuarios.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLA: PROFILES (Vinculada a auth.users de Supabase)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  estado_suscripcion TEXT NOT NULL DEFAULT 'inactiva' CHECK (estado_suscripcion IN ('activa', 'inactiva', 'pendiente', 'cancelada')),
  rol TEXT NOT NULL DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  mercadopago_customer_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. TABLA: CATEGORIAS (Temáticas de reprogramación y salud mental)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. TABLA: SESIONES (Audios e inducciones terapéuticas guiadas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sesiones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  duracion INTEGER NOT NULL DEFAULT 600, -- Duración en segundos
  audio_url TEXT NOT NULL,               -- URL del audio alojado (Cloudflare R2 / Supabase Storage / CDN)
  imagen_url TEXT,                      -- URL de la imagen de portada
  destacado BOOLEAN NOT NULL DEFAULT false,
  guia_o_autor TEXT DEFAULT 'Especialista Re-Programa',
  veces_reproducida INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. TRIGGER AUTOMÁTICO: Sincronizar nuevo usuario de auth.users a public.profiles
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nombre_completo,
    estado_suscripcion,
    rol
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'estado_suscripcion', 'inactiva'),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    nombre_completo = COALESCE(EXCLUDED.nombre_completo, profiles.nombre_completo),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador después de que un usuario se registra vía Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. HABILITAR SEGURIDAD POR FILAS (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los administradores tienen acceso completo a perfiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para Categorias
CREATE POLICY "Cualquier usuario autenticado o anónimo puede leer categorías"
  ON public.categorias FOR SELECT
  USING (true);

CREATE POLICY "Solo administradores pueden modificar categorías"
  ON public.categorias FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para Sesiones
CREATE POLICY "Lectura pública o de suscriptores para sesiones"
  ON public.sesiones FOR SELECT
  USING (true);

CREATE POLICY "Solo administradores pueden crear, editar o eliminar sesiones"
  ON public.sesiones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 7. DATOS INICIALES SEMILLA (SEED DATA)
-- ------------------------------------------------------------------------------
INSERT INTO public.categorias (id, nombre, slug, descripcion, orden)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Ansiedad y Estrés', 'ansiedad-estres', 'Técnicas clínicas para calmar el sistema nervioso simpático y regular el cortisol.', 1),
  ('c2222222-2222-2222-2222-222222222222', 'Sueño Profundo', 'sueno-profundo', 'Inducciones nocturnas para desconectar el diálogo mental y alcanzar ondas delta.', 2),
  ('c3333333-3333-3333-3333-333333333333', 'Autoestima y Confianza', 'autoestima', 'Reprogramación de creencias limitantes, síndrome del impostor y voz interior.', 3),
  ('c4444444-4444-4444-4444-444444444444', 'Enfoque y Productividad', 'enfoque', 'Entrenamiento para entrar en estado de flujo y claridad ejecutiva.', 4),
  ('c5555555-5555-5555-5555-555555555555', 'Hábitos Saludables', 'habitos', 'Control de impulsos, alimentación consciente y consistencia sostenida.', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sesiones (id, titulo, descripcion, categoria_id, duracion, audio_url, imagen_url, destacado, guia_o_autor)
VALUES
  (
    's1111111-1111-1111-1111-111111111111',
    'Inducción al Sueño Reparador y Ondas Delta',
    'Sesión guiada con tonos suaves diseñada para desconectar el diálogo mental y alcanzar un descanso fisiológico profundo toda la noche.',
    'c2222222-2222-2222-2222-222222222222',
    1260,
    'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
    'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80',
    true,
    'Dra. Valentina Montes'
  ),
  (
    's2222222-2222-2222-2222-222222222222',
    'Disolución del Estrés y Tensión Somática',
    'Protocolo de relajación marina y anclaje somático para soltar la rigidez en hombros, mandíbula y pecho.',
    'c1111111-1111-1111-1111-111111111111',
    900,
    'https://cdn.freesound.org/previews/415/415843_6142149-lq.mp3',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    true,
    'Lic. Rodrigo Silva'
  ),
  (
    's3333333-3333-3333-3333-333333333333',
    'Anclaje de Seguridad y Voz Interior Firme',
    'Potente sesión de sugestión positiva para reprogramar creencias limitantes y hablar con serenidad.',
    'c3333333-3333-3333-3333-333333333333',
    780,
    'https://cdn.freesound.org/previews/612/612869_11861866-lq.mp3',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    true,
    'Dra. Valentina Montes'
  )
ON CONFLICT (id) DO NOTHING;
