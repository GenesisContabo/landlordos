/**
 * Input sanitization utilities
 * Prevents XSS and other injection attacks
 */

/**
 * Sanitize string input by escaping HTML and limiting length
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 1000): string | null {
  if (!input) return null

  // Trim whitespace
  let sanitized = input.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Escape HTML characters to prevent XSS
  sanitized = escapeHtml(sanitized)

  return sanitized.length > 0 ? sanitized : null
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null

  const sanitized = email.trim().toLowerCase()

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return null
  }

  // Limit length
  if (sanitized.length > 255) {
    return null
  }

  return sanitized
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Remove all non-numeric characters except + and -
  const sanitized = phone.trim().replace(/[^\d+\-\s()]/g, '')

  // Limit length
  if (sanitized.length > 50) {
    return sanitized.substring(0, 50)
  }

  return sanitized.length > 0 ? sanitized : null
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number | null {
  if (input === null || input === undefined || input === '') {
    return null
  }

  const num = Number(input)
  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  return num
}

/**
 * Sanitize date input
 */
export function sanitizeDate(input: string | null | undefined): string | null {
  if (!input) return null

  // Validate ISO date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(input)) {
    return null
  }

  // Validate it's a real date
  const date = new Date(input)
  if (isNaN(date.getTime())) {
    return null
  }

  return input
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const sanitized = url.trim()

  try {
    const parsed = new URL(sanitized)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return sanitized
  } catch {
    return null
  }
}

/**
 * Sanitize text area / long form content
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 10000): string | null {
  if (!input) return null

  let sanitized = input.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Basic XSS prevention - escape HTML but allow newlines
  sanitized = escapeHtml(sanitized)

  return sanitized.length > 0 ? sanitized : null
}
