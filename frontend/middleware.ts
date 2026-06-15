import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection.
 *
 * The JWT lives in an HttpOnly cookie set by the backend (cross-origin).
 * Client-side layouts validate the session via GET /auth/me after AuthInitializer runs.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/registro']

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|public).*)',
  ],
}
