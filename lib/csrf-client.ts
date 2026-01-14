/**
 * Client-side CSRF utilities
 * Used to read and send CSRF tokens in API requests
 */

/**
 * Get CSRF token from cookies (client-side)
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-secret') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Create headers with CSRF token for API requests
 */
export function getCsrfHeaders(): HeadersInit {
  const token = getCsrfToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['x-csrf-token'] = token
  }

  return headers
}
