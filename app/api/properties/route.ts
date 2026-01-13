import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/properties - List user's properties
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, session.user.id))
      .orderBy(properties.createdAt)

    return NextResponse.json({ properties: userProperties })
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

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Property name is required' }, { status: 400 })
    }

    const [property] = await db
      .insert(properties)
      .values({
        userId: session.user.id,
        name: name.trim(),
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning()

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Failed to create property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
