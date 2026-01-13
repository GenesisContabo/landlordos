import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { units, properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/units/[id] - Get single unit
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get unit with property ownership verification
    const result = await db
      .select()
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    return NextResponse.json({ unit: result[0].units })
  } catch (error) {
    console.error('Failed to fetch unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/units/[id] - Update unit
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { unitNumber, rentAmount, status } = body

    // Verify ownership
    const result = await db
      .select()
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (unitNumber !== undefined) updateData.unitNumber = unitNumber.trim()
    if (rentAmount !== undefined) updateData.rentAmount = String(rentAmount)
    if (status !== undefined) updateData.status = status

    const [unit] = await db
      .update(units)
      .set(updateData)
      .where(eq(units.id, id))
      .returning()

    return NextResponse.json({ unit })
  } catch (error) {
    console.error('Failed to update unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/units/[id] - Delete unit
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const result = await db
      .select()
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    await db.delete(units).where(eq(units.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
