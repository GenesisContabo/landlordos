import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Allow build to proceed without DATABASE_URL (build time vs runtime)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder'

const sql = neon(DATABASE_URL)
export const db = drizzle(sql, { schema })
