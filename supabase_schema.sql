-- ==============================================================================
-- HIPNOSIS CHILE - ESQUEMA DE BASE DE DATOS SUPABASE (PostgreSQL + RLS)
-- Versión 1.0
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: usuarios (perfiles enlazados a auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre_completo TEXT,
    estado_suscripcion TEXT NOT NULL DEFAULT 'inactiva' 
        CHECK (estado_suscripcion IN ('activa', 'inactiva', 'pendiente', 'cancelada')),
    id_suscripcion_mercadopago TEXT,
    rol TEXT NOT NULL DEFAULT 'user' 
        CHECK (rol IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON public.usuarios(estado_suscripcion);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_mp_sub ON public.usuarios(id_suscripcion_mercadopago);

-- 2. TABLA: categorias
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    orden INT NOT NULL DEFAULT 0,
    icono TEXT DEFAULT 'Sparkles',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categorias_orden ON public.categorias(orden ASC);

-- 3. TABLA: sesiones
CREATE TABLE IF NOT EXISTS public.sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    id_categoria UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    duracion INT NOT NULL DEFAULT 0, -- en segundos
    url_archivo_multimedia TEXT NOT NULL,
    url_imagen_portada TEXT,
    tipo_multimedia TEXT NOT NULL DEFAULT 'audio' 
        CHECK (tipo_multimedia IN ('audio', 'video')),
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    guia_o_autor TEXT NOT NULL DEFAULT 'Hipnosis Chile',
    veces_reproducida INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_categoria ON public.sesiones(id_categoria);
CREATE INDEX IF NOT EXISTS idx_sesiones_destacado ON public.sesiones(destacado);
CREATE INDEX IF NOT EXISTS idx_sesiones_tipo ON public.sesiones(tipo_multimedia);

-- 4. TABLA: progreso_favoritos
CREATE TABLE IF NOT EXISTS public.progreso_favoritos (
    id_usuario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    id_sesion UUID NOT NULL REFERENCES public.sesiones(id) ON DELETE CASCADE,
    tiempo_reproduccion INT NOT NULL DEFAULT 0,
    completado BOOLEAN NOT NULL DEFAULT FALSE,
    es_favorito BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_usuario, id_sesion)
);

CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON public.progreso_favoritos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_progreso_favorito ON public.progreso_favoritos(id_usuario, es_favorito);

-- 5. TRIGGER: sincronizar auth.users con public.usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre_completo, estado_suscripcion, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'estado_suscripcion', 'inactiva'),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'user')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_favoritos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid() AND rol = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos en usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil"
    ON public.usuarios FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
    ON public.usuarios FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins tienen acceso total a usuarios"
    ON public.usuarios FOR ALL
    USING (public.is_admin());

-- Permisos en categorias
CREATE POLICY "Categorías son visibles públicamente"
    ON public.categorias FOR SELECT
    USING (true);

CREATE POLICY "Admins pueden gestionar categorías"
    ON public.categorias FOR ALL
    USING (public.is_admin());

-- Permisos en sesiones
CREATE POLICY "Usuarios con suscripcion activa y admins pueden ver sesiones"
    ON public.sesiones FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND estado_suscripcion = 'activa'
        ) OR
        destacado = true
    );

CREATE POLICY "Admins pueden gestionar sesiones"
    ON public.sesiones FOR ALL
    USING (public.is_admin());

-- Permisos en progreso_favoritos
CREATE POLICY "Usuarios gestionan su propio progreso"
    ON public.progreso_favoritos FOR ALL
    USING (auth.uid() = id_usuario)
    WITH CHECK (auth.uid() = id_usuario);

-- 7. CATEGORÍAS SEMILLA
INSERT INTO public.categorias (nombre, slug, descripcion, orden, icono) VALUES
('Ansiedad y Estrés', 'ansiedad-estres', 'Técnicas de reprogramación mental para calmar el sistema nervioso.', 1, 'HeartHandshake'),
('Sueño Profundo', 'sueno-profundo', 'Inducciones hipnóticas diseñadas para combatir el insomnio y descansar.', 2, 'Moon'),
('Autoestima y Confianza', 'autoestima', 'Fortalece la seguridad personal, voz interior y superación de bloqueos.', 3, 'Sparkles'),
('Enfoque y Productividad', 'enfoque', 'Estados de flujo y concentración óptima para el trabajo o estudio.', 4, 'Compass'),
('Hábitos Saludables', 'habitos', 'Control de impulsos, alimentación consciente y motivación diaria.', 5, 'Activity')
ON CONFLICT (slug) DO NOTHING;
