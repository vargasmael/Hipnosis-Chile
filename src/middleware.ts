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

  // Rutas que requieren protección: /dashboard, /biblioteca, /favoritos, /admin, /perfil, /explorar, /sesion
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/biblioteca') ||
    pathname.startsWith('/favoritos') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/perfil') ||
    pathname.startsWith('/explorar') ||
    pathname.startsWith('/sesion');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('reprograma_auth')?.value;
  const roleCookie = request.cookies.get('reprograma_role')?.value;

  // 1. Si no hay cookie de sesión autenticada -> Redirigir a /login
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = roleCookie === 'admin';

  // 2. Proteger /admin -> Solo administradores
  if (pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Las rutas privadas (/dashboard, /biblioteca, /favoritos, /sesion) permiten el paso
  // para que el AuthProvider y los wrappers de cliente lean el estado actualizado en vivo
  // directamente de Firestore, evitando rebotes en caché o cookies desfasadas.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto archivos estáticos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
