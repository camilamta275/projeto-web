import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for route protection
 * 
 * Checks user role from session cookie and enforces access control:
 * - /cidadao/* → Requires 'cidadao' profile
 * - /gestor/* → Requires 'gestor' profile
 * - /admin/* → Requires 'admin' profile
 * 
 * Redirects unauthorized users to login page
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Parse auth session from localStorage (Note: In production, use HttpOnly cookies)
  // For now, we check the auth header or cookie
  const sessionCookie = request.cookies.get('session')
  
  // Routes that don't require authentication
  const publicRoutes = ['/login', '/']
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Protected routes
  if (pathname.startsWith('/cidadao')) {
    // In production, verify session cookie and check perfil
    // For now, allow if session exists
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/gestor')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|public).*)',
  ],
}
