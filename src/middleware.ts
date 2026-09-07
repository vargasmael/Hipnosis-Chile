import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rutas públicas que no requieren ninguna autenticación
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

  // Rutas que requieren protección: /dashboard, /biblioteca, /favoritos, /admin, /perfil
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/biblioteca') ||
    pathname.startsWith('/favoritos') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/perfil');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Verificar si hay cookies de sesión demo/locales
  const demoAuthCookie = request.cookies.get('reprograma_auth')?.value;
  const demoSubCookie = request.cookies.get('reprograma_sub')?.value;
  const demoRoleCookie = request.cookies.get('reprograma_role')?.value;

  // Si Supabase es placeholder o no está conectado, usar cookies de sesión local
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    // 1. No autenticado -> Redirigir a /login
    if (!demoAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = demoRoleCookie === 'admin';
    const isSubActive = demoSubCookie === 'activa';

    // 2. Proteger /admin -> Solo admin
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Proteger /dashboard, /biblioteca, /favoritos -> Requiere suscripción activa
    if (
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/biblioteca') ||
        pathname.startsWith('/favoritos')) &&
      !isSubActive &&
      !isAdmin
    ) {
      return NextResponse.redirect(new URL('/suscripcion', request.url));
    }

    return response;
  }

  // Si Supabase sí está configurado con credenciales reales:
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

  // 1. Si no hay usuario logueado en Supabase ni en cookie local -> Redirigir a /login
  if (!user && !demoAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  let estadoSuscripcion = demoSubCookie || 'inactiva';
  let rol = demoRoleCookie || 'user';

  if (user) {
    const { data: profile } = await supabase
      .from('usuarios')
      .select('estado_suscripcion, rol')
      .eq('id', user.id)
      .single();

    if (profile) {
      estadoSuscripcion = profile.estado_suscripcion;
      rol = profile.rol;
    }
  }

  const isAdmin = rol === 'admin';
  const isSubActive = estadoSuscripcion === 'activa';

  // 2. Proteger rutas administrativas (/admin/*)
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Proteger rutas privadas de streaming (/dashboard, /biblioteca, /favoritos)
  if (
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/biblioteca') ||
      pathname.startsWith('/favoritos')) &&
    !isSubActive &&
    !isAdmin
  ) {
    return NextResponse.redirect(new URL('/suscripcion', request.url));
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
