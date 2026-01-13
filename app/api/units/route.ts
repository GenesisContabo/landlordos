import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { units, properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/units - Create new unit
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, unitNumber, rentAmount, status } = body

    if (!propertyId || !unitNumber || !rentAmount) {
      return NextResponse.json(
        { error: 'Property ID, unit number, and rent amount are required' },
        { status: 400 }
      )
    }

    // Verify property ownership
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, propertyId), eq(properties.userId, session.user.id)))
      .limit(1)

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const [unit] = await db
      .insert(units)
      .values({
        propertyId,
        unitNumber: unitNumber.trim(),
        rentAmount: String(rentAmount),
        status: status || 'vacant',
      })
      .returning()

    return NextResponse.json({ unit }, { status: 201 })
  } catch (error) {
    console.error('Failed to create unit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
