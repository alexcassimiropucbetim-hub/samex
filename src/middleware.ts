import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ignore static files, api, _next
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicPath = path === '/login' || path === '/admin-login';

  const sessionCookie = request.cookies.get('session')?.value;
  let session = null;
  
  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  // Redirect to login if accessing private route without session
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged in users away from login pages
  if (session && isPublicPath) {
    if (session.type === 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  // Admin Only Routes Protection (basically everything except /portal, /imprimir-teste, and /imprimir-resultado)
  if (session && session.type !== 'admin') {
    if (!path.startsWith('/portal') && !path.startsWith('/imprimir-teste') && !path.startsWith('/imprimir-resultado')) {
      // Encarregados cannot access admin pages (like /setores, /igrejas, etc)
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  return NextResponse.next();
}
