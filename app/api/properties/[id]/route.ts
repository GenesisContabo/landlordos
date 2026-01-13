import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/properties/[id] - Get single property
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Failed to fetch property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/properties/[id] - Update property
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, address, notes } = body

    // Verify ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Property name cannot be empty' }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    if (address !== undefined) updateData.address = address?.trim() || null
    if (notes !== undefined) updateData.notes = notes?.trim() || null

    const [property] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning()

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Failed to update property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const [existing] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await db.delete(properties).where(eq(properties.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete property:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
