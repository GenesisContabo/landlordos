import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { sanitizeString, sanitizeText } from '@/lib/sanitize'

// GET /api/properties - List user's properties
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100) // Max 100 per page
    const offset = (page - 1) * limit

    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, session.user.id))
      .orderBy(properties.createdAt)
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      properties: userProperties,
      pagination: {
        page,
        limit,
        hasMore: userProperties.length === limit
      }
    })
  } catch (error) {
    console.error('Failed to fetch properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, notes } = body

    // Sanitize inputs
    const sanitizedName = sanitizeString(name, 255)
    const sanitizedAddress = sanitizeText(address, 1000)
    const sanitizedNotes = sanitizeText(notes, 5000)

    if (!sanitizedName) {
      return NextResponse.json({ error: 'Property name is required' }, { status: 400 })
    }

    const [property] = await db
      .insert(properties)
      .values({
        userId: session.user.id,
        name: sanitizedName,
        address: sanitizedAddress,
        notes: sanitizedNotes,
      })
      .returning()

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Failed to create property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
