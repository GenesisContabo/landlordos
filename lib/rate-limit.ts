/**
 * Simple in-memory rate limiting implementation
 * For production, consider using Redis with @upstash/ratelimit
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  interval: number // milliseconds
  maxRequests: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limit by IP address
 * @param identifier - Usually IP address or user ID
 * @param config - Rate limit configuration
 * @returns Result indicating if request should be allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  // Initialize or reset if expired
  if (!store[key] || store[key].resetAt < now) {
    store[key] = {
      count: 0,
      resetAt: now + config.interval,
    }
  }

  const data = store[key]
  const remaining = Math.max(0, config.maxRequests - data.count - 1)

  // Check if rate limit exceeded
  if (data.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: data.resetAt,
    }
  }

  // Increment counter
  data.count++

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    reset: data.resetAt,
  }
}

/**
 * Get rate limit for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export function getAuthRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  })
}

/**
 * Get rate limit for API endpoints
 * 100 requests per minute per IP
 */
export function getApiRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 60 * 1000, // 1 minute
    maxRequests: 100,
  })
}

/**
 * Extract identifier from request (IP address)
 */
export function getIdentifier(request: Request): string {
  // Try various headers for IP address (CloudFlare, proxy, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')

  return (
    cfConnecting ||
    real ||
    forwarded?.split(',')[0].trim() ||
    'unknown'
  )
}
