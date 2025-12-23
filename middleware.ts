import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'limitless_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Public Routes
  // Allow access to /create/id and its sub-paths
  if (pathname.startsWith('/create/id')) {
    return NextResponse.next();
  }

  // Allow access to /login
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow access to public images
  if (pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.svg')) {
    return NextResponse.next();
  }

  // 2. Check for Authentication
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    // Redirect to login if not authenticated and trying to access protected routes
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic validation of session (expiry check)
  try {
    const decoded = JSON.parse(atob(session));
    if (decoded.expires < Date.now()) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (e) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matching paths that should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
