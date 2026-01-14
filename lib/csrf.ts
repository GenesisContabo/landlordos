/**
 * CSRF Protection Implementation
 * Uses Double Submit Cookie pattern
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Generate random string without Node.js crypto (Edge Runtime compatible)
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_SECRET_NAME = 'csrf-secret'

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return generateRandomToken()
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  const method = request.method.toUpperCase()

  // Only check state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true
  }

  // Skip CSRF check for webhooks, public APIs, and auth endpoints
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/login')
  ) {
    return true
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value

  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false
  }

  return headerToken === cookieToken
}

/**
 * Add CSRF token to response
 */
export function addCsrfToken(response: NextResponse): NextResponse {
  // Check if token already exists
  const existingToken = response.cookies.get(CSRF_TOKEN_NAME)

  if (!existingToken) {
    const token = generateCsrfToken()

    // Set as httpOnly cookie for security
    response.cookies.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    // Also set a readable version for client to access
    response.cookies.set(CSRF_SECRET_NAME, token, {
      httpOnly: false, // Readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return response
}

/**
 * Create CSRF error response
 */
export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid CSRF token. Please refresh the page and try again.' },
    { status: 403 }
  )
}

/**
 * Middleware to check CSRF tokens
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip non-API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return null
  }

  // Verify CSRF token
  if (!verifyCsrfToken(request)) {
    return csrfErrorResponse()
  }

  return null
}

/**
 * Get CSRF token from cookies (for use in client-side code)
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_SECRET_NAME)?.value
}
