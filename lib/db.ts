import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Validate DATABASE_URL in production runtime
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  // Allow build to proceed, but warn
  if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
    // Only throw error at runtime, not build time
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL environment variable is required in production')
    }
  }
  console.warn('WARNING: DATABASE_URL not set, using placeholder (development/build only)')
}

const connectionString = DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder'

// Additional validation: ensure it's not the placeholder in production runtime
if (typeof window === 'undefined' &&
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    process.env.NODE_ENV === 'production' &&
    connectionString.includes('placeholder')) {
  throw new Error('Invalid DATABASE_URL: placeholder connection string cannot be used in production')
}

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
