// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  const protectedRoutes = [
    '/dashboard',
    '/dashboard/comptable',
    '/dashboard/admin',
    '/dashboard/directeur',
  ];

  const currentPath = request.nextUrl.pathname;

  // Si pas de token et la route est protégée → redirection vers l'accueil
  if (!token && protectedRoutes.some(route => currentPath.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Le middleware s'applique uniquement à ces chemins
export const config = {
  matcher: ['/dashboard/:path*'],
};
