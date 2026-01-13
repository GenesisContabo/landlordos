import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { maintenanceRequests, units, properties } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/maintenance - List all maintenance requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db
      .select({
        request: maintenanceRequests,
        unit: units,
        property: properties,
      })
      .from(maintenanceRequests)
      .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.userId, session.user.id))
      .orderBy(desc(maintenanceRequests.createdAt))

    return NextResponse.json({ requests: result })
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/maintenance - Create new maintenance request
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { unitId, title, description, priority, photoUrl } = body

    if (!unitId || !title || !description) {
      return NextResponse.json(
        { error: 'Unit ID, title, and description are required' },
        { status: 400 }
      )
    }

    // Verify unit ownership
    const result = await db
      .select()
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(units.id, unitId), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const [maintenanceRequest] = await db
      .insert(maintenanceRequests)
      .values({
        unitId,
        title: title.trim(),
        description: description.trim(),
        priority: priority || 'medium',
        photoUrl: photoUrl?.trim() || null,
        status: 'open',
      })
      .returning()

    return NextResponse.json({ request: maintenanceRequest }, { status: 201 })
  } catch (error) {
    console.error('Failed to create maintenance request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
