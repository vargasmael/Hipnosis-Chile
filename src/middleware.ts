import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren ninguna autenticación
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/registro') ||
    pathname.startsWith('/suscripcion') ||
    pathname.startsWith('/terminos') ||
    pathname.startsWith('/privacidad') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Comprobar cookies de sesión de Supabase
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Si no hay configuración activa de Supabase (modo local/demo), permitir navegación
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Si no hay usuario logueado -> Redirigir a /login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Verificar datos de perfil (rol y estado_suscripcion)
  const { data: profile } = await supabase
    .from('usuarios')
    .select('estado_suscripcion, rol')
    .eq('id', user.id)
    .single();

  // 3. Proteger rutas administrativas (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!profile || profile.rol !== 'admin') {
      return NextResponse.redirect(new URL('/biblioteca', request.url));
    }
  }

  // 4. Proteger rutas privadas de streaming (/biblioteca, /favoritos, etc.)
  if (pathname.startsWith('/biblioteca') || pathname.startsWith('/favoritos')) {
    if (profile && profile.estado_suscripcion !== 'activa' && profile.rol !== 'admin') {
      return NextResponse.redirect(new URL('/suscripcion', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto archivos estáticos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
