import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfToken, csrfErrorResponse, addCsrfToken } from '@/lib/csrf'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. CSRF Protection for API routes (but exclude auth endpoints)
  // Auth endpoints handle CSRF via the verifyCsrfToken function's internal skip list
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    if (!verifyCsrfToken(request)) {
      return csrfErrorResponse()
    }
  }

  // 2. Authentication check for protected routes
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/pricing', '/features', '/about', '/robots.txt', '/sitemap.xml']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')

  // Allow public routes, auth routes, and API auth routes without redirect
  if (isPublicRoute || isAuthRoute || pathname.startsWith('/api/auth')) {
    const response = NextResponse.next()
    return addCsrfToken(response)
  }

  // For protected routes (like /dashboard), check for session token in cookies
  // NextAuth JWT strategy stores session in a cookie
  const sessionToken = request.cookies.get(
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  )

  // If no session token, redirect to login
  if (!sessionToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Add CSRF token to response
  const response = NextResponse.next()
  return addCsrfToken(response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
